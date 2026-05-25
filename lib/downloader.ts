import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
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
  const outputFile = type === "video" ? `${id}.mp4` : `${id}.mp3`;
  const outputPath = path.join(downloadsDir, outputFile);

  if (type === "video") {
    await runCommand("yt-dlp", [
      "--no-playlist",
      "--no-warnings",
      "-f",
      "bv*+ba/b",
      "--merge-output-format",
      "mp4",
      "-o",
      outputPath,
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
      path.join(downloadsDir, `${id}.%(ext)s`),
      info.sourceUrl,
    ]);
  }

  return addGalleryItem({
    id,
    title: info.title,
    sourceUrl: info.sourceUrl,
    platform: info.platform,
    type,
    thumbnail: info.thumbnail,
    filePath: `downloads/${outputFile}`,
    createdAt: new Date().toISOString(),
    duration: info.duration,
  });
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
