import path from "node:path";

export const projectRoot = process.cwd();
export const downloadsDir = process.env.DOWNLOADS_DIR ?? path.join(projectRoot, "downloads");
export const dataDir = process.env.DATA_DIR ?? path.join(projectRoot, "data");
export const galleryFile = path.join(dataDir, "gallery.json");
