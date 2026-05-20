# Jorge´s WM-Planer 2026

Moderne, responsive React-PWA für einen personalisierten Spielplan zur Fußball-WM 2026. Die erste Version läuft vollständig lokal mit Mock-Daten: Favoriten, Einstellungen und Kalenderexport funktionieren ohne API-Keys.

## Funktionen

- Auswahl von bis zu 8 Lieblingsmannschaften aus 48 Mock-Teams in 12 Gruppen
- Portugal ist automatisch als Favorit gesetzt
- Kader- und Aufstellungsbereich pro Mannschaft mit Platz für offizielle Spieler, Formation, Startelf und Bank
- Personalisierter Spielplan mit Favoriten-Hervorhebung und lokaler Zeitzone
- Filter nach Runde, Gruppe, Datum und Team-Suche
- Statistikbereich mit Favoriten, Lieblingsspielen und Gruppenspielen
- `.ics`-Export für Google Calendar, Apple Calendar und Outlook
- Gruppenübersicht mit Tabellenstruktur für spätere echte Stände
- PWA mit Manifest, Service Worker, Icons und Offline-Fallback
- Services und Typen für spätere Auth-, Cloud-, Live-API- und Push-Anbindung

## Installation

```bash
npm install
```

## Entwicklung starten

```bash
npm run dev
```

Die App ist danach lokal unter der von Vite ausgegebenen URL erreichbar, typischerweise `http://localhost:5173`.

## Build

```bash
npm run build
```

Optional kann der Produktionsbuild lokal getestet werden:

```bash
npm run preview
```

## Projektstruktur

```text
src/
  components/   Wiederverwendbare UI-Komponenten
  pages/        Hauptansichten der App
  hooks/        React-Hooks für App-Zustand und Service-Zugriff
  services/     Austauschbare Logikschicht für Storage, API, Kalender, Auth
  data/         Mock-Daten für Teams, Spiele, Tabellen und lokalen User
  types/        TypeScript-Datenmodelle für lokale und spätere Cloud-Daten
  utils/        Formatierung und kleine Hilfsfunktionen
  styles/       Tailwind-Einstieg
```

## Mock-Daten ersetzen

Aktuelle Daten liegen zentral in:

- `src/data/teams.ts`
- `src/data/groups.ts`
- `src/data/matches.ts`
- `src/data/stadiums.ts`
- `src/data/squads.ts`
- `src/data/standings.ts`

Diese Dateien sind als `MOCK_DATA` / `TODO_OFFICIAL_DATA` markiert. Sobald finale oder lizenzierte Daten verfügbar sind, können diese Dateien oder die Services ersetzt werden. Die UI arbeitet gegen `teamService`, `groupService`, `matchService` und `footballApi`, nicht direkt gegen externe Anbieter.

Wichtig für die aktuelle Mock-Version: Gruppe K enthält Portugal, DR Congo, Uzbekistan und Colombia. Alle Gruppen A bis L enthalten exakt 4 Teams, insgesamt also 48 Teams. Kader und Aufstellungen sind bewusst als Mock-Daten markiert, bis offizielle Spielerlisten und Startaufstellungen bekannt sind.

## Spätere Supabase- oder Firebase-Anbindung

Die Datei `.env.example` enthält optionale Platzhalter:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FOOTBALL_API_BASE_URL=
VITE_FOOTBALL_API_KEY=
```

Vorgesehene Tabellen oder Collections:

- `users`
- `teams`
- `matches`
- `favorites`
- `groups`
- `standings`
- `notification_settings`

Empfohlene Integrationspunkte:

- `src/services/authService.ts` für Supabase Auth oder Firebase Authentication
- `src/services/storageService.ts` für Cloud-Speicherung statt `localStorage`
- `src/services/footballApi.ts` für Live-Ergebnisse und Tabellen
- `src/services/notificationService.ts` für Web Push oder Firebase Cloud Messaging
- `src/services/syncService.ts` für spätere Cloud- und Realtime-Synchronisierung

## Deployment

Das Projekt ist GitHub-kompatibel und kann auf GitHub Pages, Vercel, Netlify, Firebase Hosting oder Supabase Hosting deployt werden. Für Vercel und Netlify reicht typischerweise:

- Build command: `npm run build`
- Publish directory: `dist`

Die App verwendet keine geschützten FIFA-Logos oder offiziellen Markenassets. Das App-Icon liegt lokal unter `public/icons/`.
