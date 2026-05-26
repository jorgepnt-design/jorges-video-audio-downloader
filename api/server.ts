import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { addMetadataOnly, deleteGalleryItem, ensureStorage, findGalleryItem, readGallery } from "../lib/galleryStore";
import { downloadsDir, thumbnailsDir } from "../lib/paths";
import { analyzeUrl, downloadMedia, getDownloaderDiagnostics } from "../lib/downloader";

const app = express();
const port = Number(process.env.PORT ?? 5174);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/downloads", express.static(downloadsDir, { fallthrough: false }));
app.use("/thumbnails", express.static(thumbnailsDir, { fallthrough: false, maxAge: "30d" }));

app.get("/api/health", async (_req, res) => {
  try {
    res.json(await getDownloaderDiagnostics());
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const info = await analyzeUrl(String(req.body.url ?? ""));
    res.json(info);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/download-video", async (req, res) => {
  try {
    const item = await downloadMedia(String(req.body.url ?? ""), "video");
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/download-audio", async (req, res) => {
  try {
    const item = await downloadMedia(String(req.body.url ?? ""), "audio");
    res.json(item);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/gallery", async (_req, res) => {
  try {
    res.json(await readGallery());
  } catch (error) {
    sendError(res, error);
  }
});

app.post("/api/gallery", async (req, res) => {
  try {
    res.json(await addMetadataOnly(req.body.info));
  } catch (error) {
    sendError(res, error);
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    await deleteGalleryItem(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/gallery/:id/download", async (req, res) => {
  try {
    const { item, absolutePath } = await getGalleryFile(req.params.id);
    const extension = path.extname(absolutePath).replace(".", "") || defaultExtension(item.type);
    const fileName = `${safeFileName(item.title)}.${extension}`;
    res.download(absolutePath, fileName);
  } catch (error) {
    sendError(res, error);
  }
});

app.get("/api/gallery/:id/view", async (req, res) => {
  try {
    const { item, absolutePath } = await getGalleryFile(req.params.id);
    const extension = path.extname(absolutePath).replace(".", "") || defaultExtension(item.type);
    const fileName = `${safeFileName(item.title)}.${extension}`;

    res.setHeader("Content-Type", mimeTypeFor(item.type, extension));
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(fileName)}"`);
    res.sendFile(absolutePath);
  } catch (error) {
    sendError(res, error);
  }
});

if (process.env.NODE_ENV === "production") {
  const distDir = path.join(process.cwd(), "dist");
  app.use(express.static(distDir));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(distDir, "index.html")));
}

ensureStorage().then(() => {
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
});

function sendError(res: express.Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Unerwarteter Serverfehler.";
  console.error(message);
  res.status(400).json({ error: message });
}

function safeFileName(title: string) {
  return (
    title
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "download"
  );
}

async function getGalleryFile(id: string) {
  const item = await findGalleryItem(id);
  if (!item?.filePath) {
    throw new Error("Datei wurde nicht gefunden.");
  }

  const absolutePath = path.join(downloadsDir, path.basename(item.filePath));
  if (!absolutePath.startsWith(path.resolve(downloadsDir)) || !existsSync(absolutePath)) {
    throw new Error("Datei wurde nicht gefunden.");
  }

  return { item, absolutePath };
}

function defaultExtension(type: string) {
  return type === "audio" ? "mp3" : "mp4";
}

function mimeTypeFor(type: string, extension: string) {
  if (type === "audio" || extension === "mp3") return "audio/mpeg";
  if (extension === "mov") return "video/quicktime";
  if (extension === "webm") return "video/webm";
  return "video/mp4";
}
