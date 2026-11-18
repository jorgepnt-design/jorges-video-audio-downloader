import { promises as fs } from "node:fs";
import path from "node:path";
import { deleteGalleryItem, readGallery } from "./galleryStore";
import { dataDir, downloadsDir, galleryFile, thumbnailsDir } from "./paths";

/**
 * Hält den Speicher klein. Auf Render steht nur eine kleine Platte zur
 * Verfügung (render.yaml: 1 GB). Ohne Aufräumen läuft sie voll – dann scheitert
 * jeder Schreibvorgang mit "ENOSPC: no space left on device" und gallery.json
 * kann beim Schreiben abgeschnitten werden.
 *
 * Die Downloads auf dem Server sind nur ein Zwischenspeicher: Die eigentliche
 * Ablage passiert über "In Galerie speichern" auf dem Gerät.
 *
 *  - STORAGE_LIMIT_MB   Obergrenze für Downloads + Vorschaubilder (Standard 600).
 *                       Darüber werden die ältesten Einträge gelöscht.
 */

const storageLimitBytes = Number(process.env.STORAGE_LIMIT_MB ?? 600) * 1024 * 1024;

// Dateien, die jünger sind, können zu einem laufenden Download gehören.
const inProgressGraceMs = 20 * 60 * 1000;

const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

let running: Promise<void> | null = null;

export function cleanupStorage(): Promise<void> {
  // Nie zwei Aufräumläufe gleichzeitig.
  running ??= runCleanup()
    .catch((error) => console.error("Speicher-Aufräumen fehlgeschlagen:", error))
    .finally(() => {
      running = null;
    });
  return running;
}

async function runCleanup() {
  // 1. Referenzierte IDs direkt aus dem Rohtext von gallery.json lesen. Das
  //    funktioniert auch, wenn die Datei beschädigt ist und die Platte voll –
  //    genau dann muss zuerst Platz geschaffen werden, bevor repariert werden kann.
  const raw = await fs.readFile(galleryFile, "utf8").catch(() => "");
  const referenced = new Set((raw.match(uuidPattern) ?? []).map((id) => id.toLowerCase()));

  let freed = 0;
  freed += await removeOrphans(downloadsDir, referenced);
  freed += await removeOrphans(thumbnailsDir, referenced);
  freed += await removeDataLeftovers();

  // 2. Größenlimit: älteste Einträge löschen, bis wir darunter liegen.
  let used = (await dirSize(downloadsDir)) + (await dirSize(thumbnailsDir));
  let removedItems = 0;
  if (used > storageLimitBytes) {
    const items = await readGallery();
    const oldestFirst = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    for (const item of oldestFirst) {
      if (used <= storageLimitBytes) break;
      await deleteGalleryItem(item.id);
      removedItems += 1;
      used = (await dirSize(downloadsDir)) + (await dirSize(thumbnailsDir));
    }
  }

  if (freed > 0 || removedItems > 0) {
    console.log(
      `Speicher aufgeräumt: ${formatMb(freed)} verwaiste Dateien entfernt, ` +
        `${removedItems} alte Einträge gelöscht, belegt jetzt ${formatMb(used)}.`,
    );
  }
}

// Löscht Dateien, die zu keinem Galerie-Eintrag gehören: Teildateien
// abgebrochener Downloads (.part, einzelne Spuren), Reste nach Fehlern usw.
async function removeOrphans(dir: string, referenced: Set<string>) {
  let freed = 0;
  for (const entry of await listFiles(dir)) {
    const id = entry.name.match(uuidPattern)?.[0]?.toLowerCase();
    if (id && referenced.has(id)) continue;
    if (Date.now() - entry.mtimeMs < inProgressGraceMs) continue;
    freed += await removeFile(entry.path, entry.size);
  }
  return freed;
}

// Temp-Dateien vom atomaren Schreiben und alte Sicherungen beschädigter
// gallery.json-Dateien (nur die neueste Sicherung bleibt erhalten).
async function removeDataLeftovers() {
  let freed = 0;
  const files = await listFiles(dataDir);
  for (const entry of files) {
    if (entry.name.endsWith(".tmp") && Date.now() - entry.mtimeMs > 60_000) {
      freed += await removeFile(entry.path, entry.size);
    }
  }
  const backups = files
    .filter((entry) => entry.name.startsWith("gallery.corrupt-"))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  for (const entry of backups.slice(1)) {
    freed += await removeFile(entry.path, entry.size);
  }
  return freed;
}

// Entfernt alle Dateien eines Downloads (z. B. nach einem Fehler).
export async function removeDownloadFiles(id: string) {
  for (const dir of [downloadsDir, thumbnailsDir]) {
    for (const entry of await listFiles(dir)) {
      if (entry.name.startsWith(id)) await removeFile(entry.path, entry.size);
    }
  }
}

type FileEntry = { name: string; path: string; size: number; mtimeMs: number };

async function listFiles(dir: string): Promise<FileEntry[]> {
  const names = await fs.readdir(dir).catch(() => [] as string[]);
  const entries: FileEntry[] = [];
  for (const name of names) {
    const filePath = path.join(dir, name);
    const stat = await fs.stat(filePath).catch(() => null);
    if (stat?.isFile()) entries.push({ name, path: filePath, size: stat.size, mtimeMs: stat.mtimeMs });
  }
  return entries;
}

async function dirSize(dir: string) {
  return (await listFiles(dir)).reduce((sum, entry) => sum + entry.size, 0);
}

async function removeFile(filePath: string, size: number) {
  try {
    await fs.rm(filePath, { force: true });
    return size;
  } catch {
    return 0;
  }
}

function formatMb(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
