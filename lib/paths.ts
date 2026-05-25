import path from "node:path";

export const projectRoot = process.cwd();
export const downloadsDir = path.join(projectRoot, "downloads");
export const dataDir = path.join(projectRoot, "data");
export const galleryFile = path.join(dataDir, "gallery.json");
