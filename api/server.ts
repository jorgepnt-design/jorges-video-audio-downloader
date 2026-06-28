import cors from "cors";
import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { addMetadataOnly, deleteGalleryItem, ensureStorage, findGalleryItem, readGallery } from "../lib/galleryStore";
import { downloadsDir, thumbnailsDir } from "../lib/paths";
import { analyzeUrl, downloadMedia, getDownloaderDiagnostics } from "../lib/downloader";
import { createJob, getJob, subscribe, updateJob } from "../lib/jobs";
import type { MediaType, VideoInfo } from "../lib/types";

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

app.post("/api/download-video", (req, res) => startDownloadJob(req, res, "video"));
app.post("/api/download-audio", (req, res) => startDownloadJob(req, res, "audio"));

// Live-Fortschritt eines Download-Jobs als Server-Sent-Events.
app.get("/api/jobs/:id/stream", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Download-Job wurde nicht gefunden oder ist abgelaufen." });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`);
  send(job);

  const heartbeat = setInterval(() => res.write(": ping\n\n"), 15_000);
  heartbeat.unref?.();

  const unsubscribe = subscribe(job.id, (updated) => {
    send(updated);
    if (updated.status === "done" || updated.status === "error") {
      clearInterval(heartbeat);
      res.end();
    }
  });

  // Falls der Job schon fertig ist, bevor wir uns registriert haben.
  if (job.status === "done" || job.status === "error") {
    clearInterval(heartbeat);
    res.end();
  }

  req.on("close", () => {
    clearInterval(heartbeat);
    unsubscribe();
  });
});

// Polling-Fallback (falls kein EventSource verfügbar ist).
app.get("/api/jobs/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) {
    res.status(404).json({ error: "Download-Job wurde nicht gefunden oder ist abgelaufen." });
    return;
  }
  res.json(job);
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

function startDownloadJob(req: express.Request, res: express.Response, type: MediaType) {
  const url = String(req.body.url ?? "");
  const providedInfo = (req.body.info as VideoInfo | undefined) ?? undefined;

  if (!url && !providedInfo?.sourceUrl) {
    res.status(400).json({ error: "Bitte gib einen Link an." });
    return;
  }

  const job = createJob(type);
  res.status(202).json({ jobId: job.id });

  // Download läuft im Hintergrund; der Fortschritt wird über den Job-Stream
  // ausgeliefert. Fehler landen im Job-Status statt in der HTTP-Antwort.
  void downloadMedia(url, type, {
    providedInfo,
    onProgress: ({ progress, stage }) => updateJob(job.id, { progress, stage }),
  })
    .then((item) => {
      updateJob(job.id, { status: "done", progress: 100, stage: "Fertig", item });
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : "Download fehlgeschlagen.";
      console.error(message);
      updateJob(job.id, { status: "error", error: message, stage: "Fehler" });
    });
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
