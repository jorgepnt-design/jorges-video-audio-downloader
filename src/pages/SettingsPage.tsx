import { SectionHeader } from "../components/SectionHeader";
import { SettingsPanel } from "../components/SettingsPanel";
import type { Match, UserSettings } from "../types";

export function SettingsPage({ settings, onChange, calendarMatches }: { settings: UserSettings; onChange: (settings: UserSettings) => void; calendarMatches: Match[] }) {
  return (
    <>
      <SectionHeader eyebrow="Einstellungen" title="Lokal heute, Cloud-ready morgen" description="Passe Zeitzone, Erinnerungen und Kalenderexport an. Spätere Login- und Sync-Funktionen können an die bestehenden Services andocken." />
      <SettingsPanel settings={settings} onChange={onChange} calendarMatches={calendarMatches} />
    </>
  );
}
