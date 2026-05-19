import type { UserSettings } from "../types";
import { storageService } from "../services/storageService";
import { CalendarExportButton } from "./CalendarExportButton";
import { NotificationSettings } from "./NotificationSettings";
import type { Match } from "../types";

interface Props {
  settings: UserSettings;
  onChange: (settings: UserSettings) => void;
  calendarMatches: Match[];
}

export function SettingsPanel({ settings, onChange, calendarMatches }: Props) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-white/10 bg-white/7 p-4">
        <h3 className="text-xl font-black">Zeitzone & Kalender</h3>
        <label className="mt-4 block text-sm text-white/65">
          Zeitzone
          <input value={settings.timezone} onChange={(event) => onChange({ ...settings, timezone: event.target.value })} className="mt-1 w-full rounded-md border border-white/10 bg-night px-3 py-3 text-white" />
        </label>
        <label className="mt-4 block text-sm text-white/65">
          Kalenderanbieter
          <select value={settings.calendarProvider} onChange={(event) => onChange({ ...settings, calendarProvider: event.target.value as UserSettings["calendarProvider"] })} className="mt-1 w-full rounded-md border border-white/10 bg-night px-3 py-3 text-white">
            <option value="google">Google Calendar</option>
            <option value="apple">Apple Calendar</option>
            <option value="outlook">Outlook</option>
            <option value="other">Andere</option>
          </select>
        </label>
        <div className="mt-4">
          <CalendarExportButton matches={calendarMatches} settings={settings} />
        </div>
      </section>
      <NotificationSettings settings={settings} onChange={onChange} />
      <section className="rounded-lg border border-white/10 bg-white/7 p-4 lg:col-span-2">
        <h3 className="text-xl font-black">Daten & Cloud-Vorbereitung</h3>
        <p className="mt-2 text-white/65">Aktuell arbeitet die App lokal. Auth, Cloud-Speicherung, Tippspiel-Gruppen und Realtime-Sync sind als Services vorbereitet.</p>
        <button type="button" onClick={() => { storageService.clearLocalUserData(); window.location.reload(); }} className="mt-4 rounded-md bg-ember px-4 py-3 font-bold text-white">
          Lokale Daten zurücksetzen
        </button>
      </section>
    </div>
  );
}
