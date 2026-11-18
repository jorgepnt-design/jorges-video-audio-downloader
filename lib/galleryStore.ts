import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { dataDir, downloadsDir, galleryFile, thumbnailsDir } from "./paths";
import type { GalleryItem, VideoInfo } from "./types";

export async function ensureStorage() {
  await fs.mkdir(downloadsDir, { recursive: true });
  await fs.mkdir(dataDir, { recursive: true });
  await fs.mkdir(thumbnailsDir, { recursive: true });
  try {
    await fs.access(galleryFile);
  } catch {
    await fs.writeFile(galleryFile, "[]\n", "utf8");
  }
}

// Alle Änderungen an gallery.json laufen nacheinander durch diese Kette.
// Vorher konnten zwei gleichzeitige Schreibvorgänge (z. B. zwei fertige
// Downloads) die Datei vermischen und dauerhaft unlesbar machen.
let writeChain: Promise<unknown> = Promise.resolve();

function withGalleryLock<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.catch(() => undefined);
  return run;
}

export async function readGallery(): Promise<GalleryItem[]> {
  await ensureStorage();
  const raw = await fs.readFile(galleryFile, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as GalleryItem[]) : [];
  } catch (error) {
    return withGalleryLock(() => repairGallery(raw, error));
  }
}

// Beschädigte gallery.json: Original sichern, alle noch lesbaren Einträge
// retten und die bereinigte Liste zurückschreiben, statt die App zu blockieren.
async function repairGallery(raw: string, error: unknown): Promise<GalleryItem[]> {
  // Evtl. hat ein anderer Aufruf die Datei inzwischen schon repariert.
  const current = await fs.readFile(galleryFile, "utf8").catch(() => raw);
  try {
    const parsed = JSON.parse(current);
    if (Array.isArray(parsed)) return parsed as GalleryItem[];
  } catch {
    // weiterhin kaputt
  }

  const backupFile = path.join(dataDir, `gallery.corrupt-${Date.now()}.json`);
  await fs.writeFile(backupFile, current, "utf8").catch(() => undefined);

  const recovered = recoverItems(current);
  console.error(
    `gallery.json war beschädigt (${error instanceof Error ? error.message : error}). ` +
      `${recovered.length} Einträge gerettet, Original gesichert unter ${backupFile}.`,
  );
  await writeGalleryFile(recovered);
  return recovered;
}

// Sucht alle vollständigen Objekte auf oberster Ebene des Arrays und behält
// die, die sich als gültige Galerie-Einträge lesen lassen.
function recoverItems(raw: string): GalleryItem[] {
  const items: GalleryItem[] = [];
  const seen = new Set<string>();
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
    } else if (char === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (char === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        try {
          const item = JSON.parse(raw.slice(start, i + 1)) as GalleryItem;
          if (item && typeof item.id === "string" && !seen.has(item.id)) {
            seen.add(item.id);
            items.push(item);
          }
        } catch {
          // dieses Objekt ist kaputt, überspringen
        }
        start = -1;
      }
    }
  }
  return items;
}

// Atomar schreiben: erst in eine Temp-Datei, dann umbenennen. So bleibt nie
// eine halb geschriebene gallery.json zurück (z. B. bei Neustart von Render).
async function writeGalleryFile(items: GalleryItem[]) {
  await ensureStorage();
  const tempFile = `${galleryFile}.${process.pid}.${randomUUID()}.tmp`;
  await fs.writeFile(tempFile, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  try {
    await renameWithRetry(tempFile, galleryFile);
  } catch (error) {
    await fs.rm(tempFile, { force: true }).catch(() => undefined);
    throw error;
  }
}

// Windows verweigert das Umbenennen kurzzeitig (EPERM/EBUSY/EACCES), solange
// gallery.json gerade von einer anderen Anfrage gelesen wird.
async function renameWithRetry(from: string, to: string) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await fs.rename(from, to);
      return;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      const retryable = code === "EPERM" || code === "EBUSY" || code === "EACCES";
      if (!retryable || attempt >= 20) throw error;
      await new Promise((resolve) => setTimeout(resolve, 25 * (attempt + 1)));
    }
  }
}

export async function saveGallery(items: GalleryItem[]) {
  await withGalleryLock(() => writeGalleryFile(items));
}

async function updateGallery(change: (items: GalleryItem[]) => GalleryItem[]) {
  // Lesen vor dem Lock, damit eine nötige Reparatur selbst den Lock bekommt.
  await readGallery();
  return withGalleryLock(async () => {
    const raw = await fs.readFile(galleryFile, "utf8");
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? (parsed as GalleryItem[]) : [];
    const next = change(items);
    await writeGalleryFile(next);
    return items;
  });
}

export async function addGalleryItem(item: GalleryItem) {
  await updateGallery((items) => [item, ...items.filter((existing) => existing.id !== item.id)]);
  return item;
}

export async function addMetadataOnly(info: VideoInfo) {
  return addGalleryItem({
    id: randomUUID(),
    title: info.title,
    sourceUrl: info.sourceUrl,
    platform: info.platform,
    type: "video",
    thumbnail: info.thumbnail,
    filePath: "",
    createdAt: new Date().toISOString(),
    duration: info.duration,
  });
}

export async function deleteGalleryItem(id: string) {
  const items = await updateGallery((current) => current.filter((item) => item.id !== id));
  const target = items.find((item) => item.id === id);

  if (target?.filePath) {
    const absolutePath = path.join(downloadsDir, path.basename(target.filePath));
    if (absolutePath.startsWith(path.resolve(downloadsDir))) {
      await fs.rm(absolutePath, { force: true });
    }
  }

  if (target?.thumbnail?.startsWith("/thumbnails/")) {
    const thumbnailPath = path.join(thumbnailsDir, path.basename(target.thumbnail));
    if (thumbnailPath.startsWith(path.resolve(thumbnailsDir))) {
      await fs.rm(thumbnailPath, { force: true });
    }
  }
}

export async function findGalleryItem(id: string) {
  const items = await readGallery();
  return items.find((item) => item.id === id);
}
