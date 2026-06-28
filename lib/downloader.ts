import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getCookieArgs, hasCookiesConfigured } from "./cookies";
import { addGalleryItem } from "./galleryStore";
import { downloadsDir, thumbnailsDir } from "./paths";
import type { GalleryItem, MediaType, Platform, VideoInfo } from "./types";
import { detectPlatform, validatePublicHttpUrl } from "./urlSafety";

type YtDlpInfo = {
  title?: string;
  webpage_url?: string;
  original_url?: string;
  thumbnail?: string;
  duration?: number;
  ext?: string;
};

export type ProgressHandler = (update: { progress: number; stage: string }) => void;

const desktopUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const analyzeTimeoutMs = Number(process.env.ANALYZE_TIMEOUT_MS ?? 60_000);
const downloadTimeoutMs = Number(process.env.DOWNLOAD_TIMEOUT_MS ?? 300_000);

const baseYtDlpArgs = [
  "--no-warnings",
  "--retries",
  "5",
  "--fragment-retries",
  "5",
  "--socket-timeout",
  "30",
];

// Ein erzwungener Desktop-User-Agent kann die Bot-Erkennung von Instagram
// auslösen. Standardmäßig überlässt man yt-dlp seine eigene, pro Extractor
// optimierte Logik; per USE_DESKTOP_UA=1 lässt sich der alte Wert erzwingen.
function userAgentArgs(): string[] {
  return process.env.USE_DESKTOP_UA === "1" ? ["--user-agent", desktopUserAgent] : [];
}

function commonYtDlpArgs(): string[] {
  return [...getCookieArgs(), ...userAgentArgs(), ...baseYtDlpArgs];
}

// Plattform-spezifische Zusatzargumente. YouTube blockt Server-IPs gerne mit
// einer Bot-Pruefung ("Sign in to confirm you're not a bot"). Ein anderer
// Player-Client (z. B. tv / web_safari) umgeht das oft, da diese Clients
// weniger streng geprueft werden. Beides ist per Env-Variable anpassbar.
function platformArgs(platform: Platform): string[] {
  const extra = process.env.YTDLP_EXTRA_ARGS?.trim() ? process.env.YTDLP_EXTRA_ARGS.trim().split(/\s+/) : [];
  if (platform === "YouTube") {
    const clients = process.env.YTDLP_YOUTUBE_PLAYER_CLIENT?.trim() || "default,tv,web_safari";
    return ["--extractor-args", `youtube:player_client=${clients}`, ...extra];
  }
  return extra;
}

export async function analyzeUrl(input: string): Promise<VideoInfo> {
  const safeUrl = await validatePublicHttpUrl(input);
  const platform = detectPlatform(safeUrl);
  if (platform === "Unbekannt") {
    throw new Error("Diese Plattform wird aktuell nicht unterstützt.");
  }

  const output = await runCommand(
    "yt-dlp",
    [...commonYtDlpArgs(), ...platformArgs(platform), "--dump-single-json", "--no-playlist", "--skip-download", safeUrl],
    { timeoutMs: analyzeTimeoutMs },
  );
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

export async function downloadMedia(
  input: string,
  type: MediaType,
  options: { providedInfo?: VideoInfo; onProgress?: ProgressHandler } = {},
): Promise<GalleryItem> {
  // Wenn das Frontend bereits analysiert hat, nutzen wir diese Metadaten und
  // sparen uns einen zweiten yt-dlp-Aufruf. Das halbiert die Anfragen an
  // Instagram/Facebook und senkt das Risiko einer Rate-Limit-Sperre. Die URL
  // wird trotzdem aus Sicherheitsgründen erneut geprüft.
  const info = options.providedInfo
    ? await reuseProvidedInfo(input, options.providedInfo)
    : await analyzeUrl(input);

  const id = randomUUID();
  const outputTemplate = `${id}.%(ext)s`;
  const downloadArgs = [
    ...commonYtDlpArgs(),
    ...platformArgs(info.platform),
    "--no-playlist",
    "--force-overwrites",
    "--restrict-filenames",
    "--trim-filenames",
    "160",
    "--newline",
    "--paths",
    downloadsDir,
    "-o",
    outputTemplate,
    "--print",
    "after_move:filepath",
  ];

  const onLine = makeProgressParser(type, options.onProgress);
  let downloadedFile = "";

  if (type === "video") {
    const stdout = await runCommand(
      "yt-dlp",
      [
        ...downloadArgs,
        // Kein hartes Format-Filtern mehr: "bv*+ba/b" nimmt einfach das beste
        // verfügbare Video + Audio (oder eine progressive Datei). Die
        // Codec-/Container-Präferenz für iPhone-Kompatibilität wird über die
        // Sortierung (-S) ausgedrückt, die niemals zum Fehlschlag führt.
        "-f",
        "bv*+ba/b",
        "-S",
        "ext:mp4:m4a,vcodec:h264:h265,acodec:aac:m4a",
        "--merge-output-format",
        "mp4",
        "--remux-video",
        "mp4",
        info.sourceUrl,
      ],
      { onLine, timeoutMs: downloadTimeoutMs },
    );
    downloadedFile = resolveReportedPath(stdout, id);
  } else {
    const stdout = await runCommand(
      "yt-dlp",
      [...downloadArgs, "-x", "--audio-format", "mp3", "--audio-quality", "0", info.sourceUrl],
      { onLine, timeoutMs: downloadTimeoutMs },
    );
    downloadedFile = resolveReportedPath(stdout, id);
  }

  options.onProgress?.({ progress: 97, stage: "Erstellt Vorschaubild" });
  const finalFile = downloadedFile || (await findDownloadedFile(id, type));
  const thumbnail = await createLocalThumbnail(finalFile, id, type, info.thumbnail);

  const item = await addGalleryItem({
    id,
    title: info.title,
    sourceUrl: info.sourceUrl,
    platform: info.platform,
    type,
    thumbnail,
    filePath: toPublicDownloadPath(finalFile),
    downloadUrl: `/api/gallery/${id}/download`,
    viewUrl: `/api/gallery/${id}/view`,
    createdAt: new Date().toISOString(),
    duration: info.duration,
  });

  options.onProgress?.({ progress: 100, stage: "Fertig" });
  return item;
}

async function reuseProvidedInfo(input: string, providedInfo: VideoInfo): Promise<VideoInfo> {
  const safeUrl = await validatePublicHttpUrl(providedInfo.sourceUrl || input);
  const platform = detectPlatform(safeUrl);
  if (platform === "Unbekannt") {
    throw new Error("Diese Plattform wird aktuell nicht unterstützt.");
  }
  return { ...providedInfo, sourceUrl: safeUrl, platform };
}

export async function getDownloaderDiagnostics() {
  const [ytDlpVersion, ffmpegVersion] = await Promise.all([
    runCommand("yt-dlp", ["--version"], { timeoutMs: 15_000 }).catch((error) =>
      error instanceof Error ? error.message : "yt-dlp nicht verfügbar",
    ),
    runCommand("ffmpeg", ["-version"], { timeoutMs: 15_000 }).catch((error) =>
      error instanceof Error ? error.message : "ffmpeg nicht verfügbar",
    ),
  ]);

  return {
    ytDlpVersion: ytDlpVersion.split(/\r?\n/)[0],
    ffmpegVersion: ffmpegVersion.split(/\r?\n/)[0],
    cookiesConfigured: hasCookiesConfigured(),
    downloadsDir,
  };
}

function makeProgressParser(type: MediaType, onProgress?: ProgressHandler) {
  if (!onProgress) return undefined;

  const downloadStage = type === "audio" ? "Lädt Audio" : "Lädt Video";

  return (line: string) => {
    const percentMatch = line.match(/(\d{1,3}(?:\.\d+)?)%/);
    if (line.includes("[download]") && percentMatch) {
      // yt-dlp lädt bei Video evtl. zwei Streams (Video, dann Audio); der
      // Prozentwert läuft pro Stream von 0 bis 100. Wir bilden ihn auf 0-90 ab
      // und reservieren den Rest für Zusammenführen/Konvertieren/Thumbnail.
      const raw = Math.min(100, Math.max(0, Number(percentMatch[1])));
      onProgress({ progress: Math.round(raw * 0.9), stage: downloadStage });
      return;
    }
    if (line.includes("[Merger]")) {
      onProgress({ progress: 93, stage: "Führt Video und Audio zusammen" });
    } else if (line.includes("[ExtractAudio]")) {
      onProgress({ progress: 93, stage: "Konvertiert zu MP3" });
    } else if (line.includes("[VideoRemuxer]") || line.includes("Remux")) {
      onProgress({ progress: 95, stage: "Optimiert für MP4" });
    }
  };
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

async function createLocalThumbnail(sourceFile: string, id: string, type: MediaType, fallbackUrl: string) {
  await fs.mkdir(thumbnailsDir, { recursive: true });

  if (type === "video") {
    const thumbnailPath = path.join(thumbnailsDir, `${id}.jpg`);
    try {
      await runCommand(
        "ffmpeg",
        ["-y", "-ss", "00:00:01", "-i", sourceFile, "-frames:v", "1", "-vf", "scale=640:-1", thumbnailPath],
        { timeoutMs: 30_000 },
      );
      await fs.access(thumbnailPath);
      return toPublicThumbnailPath(thumbnailPath);
    } catch {
      // Fall back to the platform thumbnail below.
    }
  }

  return downloadRemoteThumbnail(fallbackUrl, id);
}

async function downloadRemoteThumbnail(thumbnailUrl: string, id: string) {
  if (!thumbnailUrl) return "";

  try {
    const response = await fetch(thumbnailUrl, {
      headers: {
        "User-Agent": desktopUserAgent,
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) return thumbnailUrl;

    const contentType = response.headers.get("content-type") ?? "";
    const extension = thumbnailExtension(contentType, thumbnailUrl);
    const thumbnailPath = path.join(thumbnailsDir, `${id}${extension}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(thumbnailPath, buffer);
    return toPublicThumbnailPath(thumbnailPath);
  } catch {
    return thumbnailUrl;
  }
}

function thumbnailExtension(contentType: string, thumbnailUrl: string) {
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("avif")) return ".avif";

  const extension = path.extname(new URL(thumbnailUrl).pathname).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".avif"].includes(extension)) return extension;
  return ".jpg";
}

function toPublicThumbnailPath(absolutePath: string) {
  return `/thumbnails/${path.basename(absolutePath)}`;
}

function runCommand(
  command: string,
  args: string[],
  options: { onLine?: (line: string) => void; timeoutMs?: number } = {},
) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    let lineBuffer = "";
    let timedOut = false;

    const timeoutMs = options.timeoutMs ?? 0;
    const timer =
      timeoutMs > 0
        ? setTimeout(() => {
            timedOut = true;
            child.kill("SIGKILL");
          }, timeoutMs)
        : null;
    timer?.unref?.();

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      if (options.onLine) {
        // yt-dlp-Fortschritt nutzt mit --newline echte Zeilenumbrüche, sonst \r.
        lineBuffer += text;
        const parts = lineBuffer.split(/\r\n|\r|\n/);
        lineBuffer = parts.pop() ?? "";
        for (const line of parts) {
          if (line.trim()) options.onLine(line);
        }
      }
    });

    child.on("error", () => {
      if (timer) clearTimeout(timer);
      reject(
        new Error(
          `${command} wurde nicht gefunden. Bitte installiere yt-dlp und ffmpeg und stelle sicher, dass beide im PATH liegen.`,
        ),
      );
    });

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (timedOut) {
        reject(
          new Error(
            "Zeitüberschreitung: Der Download hat zu lange gedauert und wurde abgebrochen. Versuche ein kürzeres Video oder erhöhe DOWNLOAD_TIMEOUT_MS.",
          ),
        );
        return;
      }
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

  const normalized = stderr.toLowerCase();
  const cookieHint = hasCookiesConfigured()
    ? ""
    : " Tipp: Hinterlege eigene Cookies (Umgebungsvariable YTDLP_COOKIES_FILE oder YTDLP_COOKIES), um Inhalte zu laden, für die du angemeldet sein musst.";

  if (normalized.includes("sign in to confirm") || normalized.includes("not a bot") || normalized.includes("confirm you")) {
    return `Die Plattform verlangt eine Login- oder Bot-Prüfung für diesen Inhalt.${cookieHint}`;
  }
  if (normalized.includes("rate-limit") || normalized.includes("rate limit") || normalized.includes("429")) {
    return `Die Plattform hat zu viele Anfragen blockiert (Rate-Limit). Warte einen Moment und versuche es erneut.${cookieHint}`;
  }
  if (
    normalized.includes("login required") ||
    normalized.includes("login_required") ||
    normalized.includes("requires login") ||
    normalized.includes("private video") ||
    normalized.includes("this content isn't available") ||
    normalized.includes("only available for registered users")
  ) {
    return `Dieser Inhalt ist privat oder erfordert eine Anmeldung.${cookieHint}`;
  }
  if (normalized.includes("unsupported url")) {
    return "Diese URL wird von yt-dlp nicht unterstützt. Prüfe, ob es ein direkter Link zum Video/Reel/Post ist.";
  }
  if (normalized.includes("requested format is not available")) {
    return "Für diesen Inhalt ist kein passendes Download-Format verfügbar.";
  }
  if (normalized.includes("video unavailable") || normalized.includes("not available")) {
    return "Das Video ist nicht (mehr) verfügbar oder in deiner Region gesperrt.";
  }
  if (normalized.includes("ffmpeg")) {
    return "ffmpeg wird für diese Aktion benötigt oder konnte nicht gestartet werden.";
  }

  // Sonst die echte yt-dlp-Fehlerzeile durchreichen, statt sie zu verschlucken.
  const errorLine = stderr
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reverse()
    .find((line) => line.startsWith("ERROR:"));
  if (errorLine) return errorLine.replace(/^ERROR:\s*/, "").trim();

  return stderr.split(/\r?\n/).filter(Boolean).slice(-2).join(" ").trim();
}
