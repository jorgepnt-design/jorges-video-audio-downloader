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

export async function readGallery(): Promise<GalleryItem[]> {
  await ensureStorage();
  const raw = await fs.readFile(galleryFile, "utf8");
  return JSON.parse(raw) as GalleryItem[];
}

export async function saveGallery(items: GalleryItem[]) {
  await ensureStorage();
  await fs.writeFile(galleryFile, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export async function addGalleryItem(item: GalleryItem) {
  const items = await readGallery();
  const next = [item, ...items];
  await saveGallery(next);
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
  const items = await readGallery();
  const target = items.find((item) => item.id === id);
  await saveGallery(items.filter((item) => item.id !== id));

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
