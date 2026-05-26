import path from "node:path";

export const projectRoot = process.cwd();
export const downloadsDir = process.env.DOWNLOADS_DIR ?? path.join(projectRoot, "downloads");
export const dataDir = process.env.DATA_DIR ?? path.join(projectRoot, "data");
export const thumbnailsDir = process.env.THUMBNAILS_DIR ?? path.join(dataDir, "thumbnails");
export const galleryFile = path.join(dataDir, "gallery.json");
