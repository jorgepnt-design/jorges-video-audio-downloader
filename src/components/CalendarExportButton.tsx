import { Download } from "lucide-react";
import type { Match, UserSettings } from "../types";
import { useCalendarExport } from "../hooks/useCalendarExport";

export function CalendarExportButton({ matches, settings, label = "Meine Spiele in Kalender exportieren" }: { matches: Match[]; settings: UserSettings; label?: string }) {
  const { exportCalendar } = useCalendarExport(matches, settings);
  return (
    <button
      type="button"
      onClick={exportCalendar}
      disabled={matches.length === 0}
      className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 font-bold text-night disabled:cursor-not-allowed disabled:opacity-45"
    >
      <Download size={18} aria-hidden />
      {label}
    </button>
  );
}
