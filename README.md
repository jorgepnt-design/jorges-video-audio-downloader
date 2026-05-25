# Jorge's Video & Audio Downloader

Moderne lokale Web-App zum Analysieren und Herunterladen von Video- und Audioinhalten, fuer die du die Rechte besitzt oder bei denen ein Download ausdruecklich erlaubt ist.

Die App nutzt React, TypeScript, Vite und einen Express-API-Server. Downloads laufen serverseitig ueber `yt-dlp`; MP3-Konvertierung nutzt `ffmpeg`.

## Funktionen

- Link einfügen und analysieren
- Plattform-Erkennung fuer YouTube, Instagram, TikTok, X/Twitter und Facebook
- Anzeige von Titel, Thumbnail, Plattform, Dauer, Dateityp und Download-Optionen
- Video als MP4 speichern
- Audio als MP3 extrahieren
- Download-Historie / Galerie als responsives Grid
- Galerie-Suche und Filter nach Typ oder Plattform
- Medien löschen
- Gespeicherte Datei direkt öffnen
- Lokale Metadaten in `data/gallery.json`
- Downloads im Projektordner `downloads/`

## Rechtlicher Hinweis

Bitte lade nur Inhalte herunter, an denen du die Rechte besitzt oder fuer die der Download erlaubt ist. Diese App darf nicht verwendet werden, um DRM, Paywalls, Login-Schutz, private Inhalte oder technische Schutzmechanismen zu umgehen.

## Voraussetzungen

- Node.js 20 oder neuer
- npm
- `yt-dlp`
- `ffmpeg`

### yt-dlp installieren

Windows mit winget:

```powershell
winget install yt-dlp.yt-dlp
```

Alternativ mit Python:

```powershell
pip install -U yt-dlp
```

### ffmpeg installieren

Windows mit winget:

```powershell
winget install Gyan.FFmpeg
```

Danach sicherstellen, dass `yt-dlp` und `ffmpeg` im PATH liegen:

```powershell
yt-dlp --version
ffmpeg -version
```

## Installation

```powershell
npm install
```

Optional `.env.example` nach `.env` kopieren:

```powershell
Copy-Item .env.example .env
```

## Lokaler Start

```powershell
npm run dev
```

Frontend:

```text
http://localhost:5173
```

API:

```text
http://localhost:5174
```

## API-Endpunkte

- `POST /api/analyze`
- `POST /api/download-video`
- `POST /api/download-audio`
- `GET /api/gallery`
- `POST /api/gallery`
- `DELETE /api/gallery/:id`

Beispiel fuer Analyse:

```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

## Projektstruktur

```text
api/
  server.ts
lib/
  downloader.ts
  galleryStore.ts
  paths.ts
  types.ts
  urlSafety.ts
src/
  App.tsx
  main.tsx
  styles/index.css
data/
  gallery.json
downloads/
README.md
.env.example
package.json
.gitignore
```

## Speicherung

Zum Start nutzt die App eine lokale JSON-Datei:

```text
data/gallery.json
```

Die Storage-Logik ist in `lib/galleryStore.ts` gekapselt. Dadurch kann spaeter relativ einfach Supabase, Firebase, SQLite oder ein eigener Cloud-Speicher angebunden werden, ohne das Frontend neu zu strukturieren.

## Sicherheit

Die API prueft eingehende URLs:

- nur `http` und `https`
- blockiert `localhost`, `127.0.0.1`, `0.0.0.0`, `::1`
- blockiert private IPv4-Bereiche wie `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`
- blockiert lokale IPv6-Bereiche
- erlaubt nur die vorgesehenen Plattformen
- keine Cookies, Logins oder Umgehungsmechanismen

## Build

```powershell
npm run build
```

Produktionsstart nach dem Build:

```powershell
npm start
```

## Deployment

### GitHub

1. Repository erstellen.
2. `.gitignore` pruefen: `downloads/` und `data/gallery.json` werden nicht committed.
3. Code pushen.
4. Deployment-Anbieter mit dem Repository verbinden.

### Vercel

Vercel ist ideal fuer Frontends, aber serverseitige Downloads mit `yt-dlp` und `ffmpeg` sind dort nur eingeschraenkt sinnvoll, weil Serverless-Umgebungen kurzlebig sind und Binary-Abhaengigkeiten brauchen. Empfehlung: Frontend auf Vercel, API separat auf Render, Railway oder eigenem Server betreiben.

### Render

1. Web Service erstellen.
2. Repository verbinden.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. `yt-dlp` und `ffmpeg` im Render-Image oder ueber ein Dockerfile bereitstellen.
6. Fuer dauerhafte Dateien ein Persistent Disk konfigurieren und `downloads/` sowie `data/` darauf legen.

### Railway

1. Neues Railway-Projekt aus GitHub-Repo erstellen.
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. `yt-dlp` und `ffmpeg` ueber Nixpacks oder Dockerfile installieren.
5. Persistente Volumes fuer Downloads und Metadaten verwenden.

### Eigener Server

1. Node.js, npm, `yt-dlp` und `ffmpeg` installieren.
2. Repository klonen.
3. `npm install`
4. `npm run build`
5. `npm start`
6. Optional mit Nginx als Reverse Proxy vor `http://localhost:5174` betreiben.
7. `downloads/` regelmaessig sichern oder auf einen separaten Datentraeger legen.

## Spaetere Erweiterungen

- Login und Nutzerkonten
- Supabase/Firebase Storage
- Rollen und Quotas
- Cloud-Galerie pro Nutzer
- Job-Queue fuer lange Downloads
- WebSocket- oder SSE-Fortschritt pro Download
