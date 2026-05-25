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

const desktopUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

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
  const outputTemplate = `${id}.%(ext)s`;
  const baseArgs = [
    "--no-playlist",
    "--no-warnings",
    "--force-overwrites",
    "--restrict-filenames",
    "--trim-filenames",
    "160",
    "--user-agent",
    desktopUserAgent,
    "--paths",
    downloadsDir,
    "-o",
    outputTemplate,
    "--print",
    "after_move:filepath",
  ];
  let downloadedFile = "";

  if (type === "video") {
    const stdout = await runCommand("yt-dlp", [
      ...baseArgs,
      "-f",
      "bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc1]/best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best",
      "--merge-output-format",
      "mp4",
      "--remux-video",
      "mp4",
      info.sourceUrl,
    ]);
    downloadedFile = resolveReportedPath(stdout, id);
  } else {
    const stdout = await runCommand("yt-dlp", [
      ...baseArgs,
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      info.sourceUrl,
    ]);
    downloadedFile = resolveReportedPath(stdout, id);
  }

  const finalFile = downloadedFile || (await findDownloadedFile(id, type));

  return addGalleryItem({
    id,
    title: info.title,
    sourceUrl: info.sourceUrl,
    platform: info.platform,
    type,
    thumbnail: info.thumbnail,
    filePath: toPublicDownloadPath(finalFile),
    downloadUrl: `/api/gallery/${id}/download`,
    createdAt: new Date().toISOString(),
    duration: info.duration,
  });
}

function resolveReportedPath(stdout: string, id: string) {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const reported = [...lines].reverse().find((line) => line.includes(id));
  if (!reported) return "";
  return path.isAbsolute(reported) ? reported : path.join(downloadsDir, reported);
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
