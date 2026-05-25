import cors from "cors";
import express from "express";
import path from "node:path";
import { addMetadataOnly, deleteGalleryItem, ensureStorage, readGallery } from "../lib/galleryStore";
import { downloadsDir } from "../lib/paths";
import { analyzeUrl, downloadMedia } from "../lib/downloader";

const app = express();
const port = Number(process.env.PORT ?? 5174);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/downloads", express.static(downloadsDir, { fallthrough: false }));

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
  res.status(400).json({ error: message });
}
