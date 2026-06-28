import { copyFileSync, existsSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Resolves yt-dlp cookie arguments from the environment.
 *
 * Instagram und Facebook verlangen für viele Inhalte einen eingeloggten
 * Zustand. Auf einem Server (Render) werden Anfragen ohne Cookies fast immer
 * mit einer Login- oder Bot-Prüfung blockiert. Über die folgenden
 * Umgebungsvariablen lassen sich eigene Cookies hinterlegen – gedacht für
 * Inhalte, an denen man die Rechte besitzt oder für die der Download erlaubt
 * ist.
 *
 * Unterstützte Varianten (in dieser Reihenfolge geprüft):
 *  - YTDLP_COOKIES_FILE        Pfad zu einer Netscape-Cookie-Datei
 *                              (z. B. ein Render "Secret File").
 *  - YTDLP_COOKIES             Roher Netscape-Cookie-Inhalt als String.
 *                              Wird einmalig in eine temporäre Datei
 *                              geschrieben (praktisch für Render-Env-Vars).
 *  - YTDLP_COOKIES_FROM_BROWSER Browsername für `--cookies-from-browser`
 *                              (nur lokal sinnvoll, z. B. "chrome",
 *                              "firefox", "edge", "safari").
 */

let cachedCookieFile: string | null | undefined;

function resolveCookieFile(): string | null {
  if (cachedCookieFile !== undefined) return cachedCookieFile;

  const explicitFile = process.env.YTDLP_COOKIES_FILE?.trim();
  if (explicitFile && existsSync(explicitFile)) {
    // yt-dlp schreibt die Cookie-Datei am Ende zurück. Render-Secret-Files
    // (z. B. /etc/secrets/cookies.txt) liegen aber auf einem schreibgeschützten
    // Dateisystem -> "Read-only file system". Daher kopieren wir die Datei
    // einmalig in einen beschreibbaren temporären Ordner und nutzen die Kopie.
    try {
      const dir = mkdtempSync(path.join(os.tmpdir(), "ytdlp-cookies-"));
      const file = path.join(dir, "cookies.txt");
      copyFileSync(explicitFile, file);
      cachedCookieFile = file;
      return cachedCookieFile;
    } catch {
      // Falls das Kopieren scheitert, notfalls die Originaldatei verwenden.
      cachedCookieFile = explicitFile;
      return cachedCookieFile;
    }
  }

  const rawCookies = process.env.YTDLP_COOKIES?.trim();
  if (rawCookies) {
    try {
      const dir = mkdtempSync(path.join(os.tmpdir(), "ytdlp-cookies-"));
      const file = path.join(dir, "cookies.txt");
      const content = rawCookies.startsWith("# Netscape")
        ? rawCookies
        : `# Netscape HTTP Cookie File\n${rawCookies}`;
      writeFileSync(file, `${content}\n`, { mode: 0o600 });
      cachedCookieFile = file;
      return cachedCookieFile;
    } catch {
      // Fällt unten auf "keine Cookie-Datei" zurück.
    }
  }

  cachedCookieFile = null;
  return cachedCookieFile;
}

export function getCookieArgs(): string[] {
  const cookieFile = resolveCookieFile();
  if (cookieFile) {
    return ["--cookies", cookieFile];
  }

  const fromBrowser = process.env.YTDLP_COOKIES_FROM_BROWSER?.trim();
  if (fromBrowser) {
    return ["--cookies-from-browser", fromBrowser];
  }

  return [];
}

export function hasCookiesConfigured(): boolean {
  return getCookieArgs().length > 0;
}
