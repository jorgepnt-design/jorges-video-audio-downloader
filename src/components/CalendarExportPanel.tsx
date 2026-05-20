import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import type { Match, Team, UserSettings } from "../types";
import { CalendarExportButton } from "./CalendarExportButton";

type ExportMode = "portugal" | "favorites" | "all";

interface Props {
  allMatches: Match[];
  favoriteMatches: Match[];
  favoriteTeams: Team[];
  settings: UserSettings;
}

const labels: Record<ExportMode, string> = {
  portugal: "nur Portugal",
  favorites: "alle Favoriten",
  all: "alle Spiele",
};

export function CalendarExportPanel({ allMatches, favoriteMatches, favoriteTeams, settings }: Props) {
  const [mode, setMode] = useState<ExportMode>("favorites");
  const portugalMatches = useMemo(() => allMatches.filter((match) => match.teamAId === "por" || match.teamBId === "por"), [allMatches]);
  const matches = mode === "portugal" ? portugalMatches : mode === "favorites" ? favoriteMatches : allMatches;
  const favoriteLabel = favoriteTeams.length > 1 ? `${favoriteTeams.length} Favoriten` : "Favoriten";

  return (
    <section className="rounded-lg border border-gold/25 bg-gold/10 p-4">
      <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gold">
        <CalendarDays size={16} aria-hidden /> Kalenderexport
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["portugal", "favorites", "all"] as ExportMode[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setMode(item)}
            className={`rounded-md border px-3 py-2 text-sm font-bold transition ${
              mode === item ? "border-gold bg-gold text-night" : "border-white/10 bg-white/10 text-white hover:border-gold/40"
            }`}
          >
            {item === "favorites" ? favoriteLabel : labels[item]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CalendarExportButton matches={matches} settings={settings} label={`${matches.length} Spiele exportieren`} filename={`jorge-wm-2026-${mode}.ics`} />
        <p className="text-sm text-white/60">Auswahl: {labels[mode]}</p>
      </div>
    </section>
  );
}
