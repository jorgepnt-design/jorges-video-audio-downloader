import { Download } from "lucide-react";
import { useState } from "react";
import type { Match, UserSettings } from "../types";
import { useCalendarExport } from "../hooks/useCalendarExport";

export function CalendarExportButton({ matches, settings, label = "Meine Spiele in Kalender exportieren", filename }: { matches: Match[]; settings: UserSettings; label?: string; filename?: string }) {
  const [exportedCount, setExportedCount] = useState<number | null>(null);
  const { exportCalendar } = useCalendarExport(matches, settings, filename);
  const handleExport = () => {
    setExportedCount(exportCalendar());
    window.setTimeout(() => setExportedCount(null), 3500);
  };

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={matches.length === 0}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 font-bold text-night transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <Download size={18} aria-hidden />
        {label}
      </button>
      {exportedCount !== null && <span className="rounded-md border border-pitch/30 bg-pitch/15 px-3 py-2 text-sm font-bold text-green-100">{exportedCount} Spiele exportiert</span>}
    </span>
  );
}
