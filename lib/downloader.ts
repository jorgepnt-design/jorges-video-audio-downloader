import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { addGalleryItem } from "./galleryStore";
import { downloadsDir } from "./paths";
import type { GalleryItem, MediaType, VideoInfo } from "./types";
import { detectPlatform, validatePublicHttpUrl } from "./urlSafety";

type YtDlpInfo = {
  title?: string;
  webpage_url?: string;
  original_url?: string;
  thumbnail?: string;
  duration?: number;
  ext?: string;
};

export async function analyzeUrl(input: string): Promise<VideoInfo> {
  const safeUrl = await validatePublicHttpUrl(input);
  const platform = detectPlatform(safeUrl);
  if (platform === "Unbekannt") {
    throw new Error("Diese Plattform wird aktuell nicht unterstützt.");
  }

  const output = await runCommand("yt-dlp", ["--dump-json", "--no-playlist", "--skip-download", "--no-warnings", safeUrl]);
  const info = JSON.parse(output) as YtDlpInfo;

  return {
    title: info.title ?? "Unbenanntes Video",
    sourceUrl: info.webpage_url ?? info.original_url ?? safeUrl,
    platform,
    thumbnail: info.thumbnail ?? "",
    duration: typeof info.duration === "number" ? Math.round(info.duration) : null,
    fileType: info.ext ? info.ext.toUpperCase() : "MP4 / MP3",
    downloadOptions: ["MP4-Video", "MP3-Audio"],
  };
}

export async function downloadMedia(input: string, type: MediaType): Promise<GalleryItem> {
  const info = await analyzeUrl(input);
  const id = randomUUID();
  const outputTemplate = path.join(downloadsDir, `${id}.%(ext)s`);

  if (type === "video") {
    await runCommand("yt-dlp", [
      "--no-playlist",
      "--no-warnings",
      "-f",
      "bv*+ba/best[ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "-o",
      outputTemplate,
      info.sourceUrl,
    ]);
  } else {
    await runCommand("yt-dlp", [
      "--no-playlist",
      "--no-warnings",
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "-o",
      outputTemplate,
      info.sourceUrl,
    ]);
  }

  const downloadedFile = await findDownloadedFile(id, type);

  return addGalleryItem({
    id,
    title: info.title,
    sourceUrl: info.sourceUrl,
    platform: info.platform,
    type,
    thumbnail: info.thumbnail,
    filePath: toPublicDownloadPath(downloadedFile),
    createdAt: new Date().toISOString(),
    duration: info.duration,
  });
}

async function findDownloadedFile(id: string, type: MediaType) {
  const expectedExtension = type === "audio" ? ".mp3" : ".mp4";
  const expectedPath = path.join(downloadsDir, `${id}${expectedExtension}`);

  try {
    await fs.access(expectedPath);
    return expectedPath;
  } catch {
    const files = await fs.readdir(downloadsDir);
    const candidates = files
      .filter((file) => file.startsWith(`${id}.`))
      .map((file) => path.join(downloadsDir, file));

    if (candidates.length > 0) {
      return candidates[0];
    }
  }

  throw new Error("Download wurde abgeschlossen, aber die Datei konnte nicht im Download-Ordner gefunden werden.");
}

function toPublicDownloadPath(absolutePath: string) {
  return `downloads/${path.basename(absolutePath)}`;
}

function runCommand(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", () => {
      reject(new Error(`${command} wurde nicht gefunden. Bitte installiere yt-dlp und ffmpeg und stelle sicher, dass beide im PATH liegen.`));
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error(cleanToolError(stderr)));
    });
  });
}

function cleanToolError(stderr: string) {
  if (!stderr.trim()) return "Download konnte nicht abgeschlossen werden.";
  if (stderr.includes("Unsupported URL")) return "Diese URL wird von yt-dlp nicht unterstützt.";
  if (stderr.includes("Private video") || stderr.includes("login")) {
    return "Private, geschützte oder Login-pflichtige Inhalte werden nicht heruntergeladen.";
  }
  if (stderr.includes("ffmpeg")) return "ffmpeg wird für diese Aktion benötigt oder konnte nicht gestartet werden.";
  return stderr.split("\n").slice(-3).join(" ").trim();
}
