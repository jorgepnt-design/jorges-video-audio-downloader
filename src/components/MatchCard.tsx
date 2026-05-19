import { MapPin, Star } from "lucide-react";
import { matchService } from "../services/matchService";
import type { Match, Prediction } from "../types";
import { formatLocalDate, formatLocalTime, formatUtcTime } from "../utils/date";

interface Props {
  match: Match;
  isFavorite: boolean;
  prediction?: Prediction;
  timezone: string;
  children?: React.ReactNode;
}

const statusLabel = {
  scheduled: "Geplant",
  live: "Live",
  finished: "Beendet",
  postponed: "Verschoben",
};

export function MatchCard({ match, isFavorite, prediction, timezone, children }: Props) {
  const enriched = matchService.enrich(match);

  return (
    <article
      className={`rounded-lg border p-4 transition duration-200 hover:-translate-y-0.5 ${
        isFavorite ? "border-gold bg-gold/12 shadow-glow" : "border-white/10 bg-white/7 hover:border-white/20"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-gold">
            {match.round}
            {match.groupName ? ` · ${match.groupName}` : ""}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {formatLocalDate(match.dateUtc, timezone)} · Lokal {formatLocalTime(match.dateUtc, timezone)} · {formatUtcTime(match.dateUtc)}
          </p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-bold ${match.status === "live" ? "bg-ember text-white" : "bg-white/10 text-white/70"}`}>
          {statusLabel[match.status]}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <p className="inline-flex items-center gap-2 text-lg font-black">
          <span>{enriched.teamAFlag}</span>
          {enriched.teamAName}
        </p>
        <div className="rounded-md bg-night px-3 py-2 text-center font-black">
          {match.scoreA === null ? "-" : match.scoreA} : {match.scoreB === null ? "-" : match.scoreB}
        </div>
        <p className="inline-flex items-center justify-end gap-2 text-right text-lg font-black">
          <span>{enriched.teamBFlag}</span>
          {enriched.teamBName}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-white/60">
        <span className="flex items-center gap-1">
          <MapPin size={16} aria-hidden /> {match.stadium}, {match.city}
        </span>
        <span className="flex items-center gap-1">
          {isFavorite && <Star size={16} fill="currentColor" aria-hidden />} {prediction ? "Tipp gespeichert" : "Noch kein Tipp"}
        </span>
      </div>
      {children && <div className="mt-4 border-t border-white/10 pt-4">{children}</div>}
    </article>
  );
}
