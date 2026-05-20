import { CalendarDays, ShieldCheck, Star } from "lucide-react";
import type { Match, Team, UserSettings } from "../types";
import { formatLocalDate, formatLocalTime } from "../utils/date";
import { CalendarExportButton } from "./CalendarExportButton";
import { DataStatusBadge } from "./DataStatusBadge";
import { FlagIcon } from "./FlagIcon";
import { matchService } from "../services/matchService";
import { teamService } from "../services/teamService";

interface Props {
  portugal: Team;
  allMatches: Match[];
  nextPortugalMatch?: Match;
  settings: UserSettings;
  onOpenTeams: () => void;
}

export function PortugalFocusCard({ portugal, allMatches, nextPortugalMatch, settings, onOpenTeams }: Props) {
  const portugalMatches = allMatches.filter((match) => match.teamAId === portugal.id || match.teamBId === portugal.id);
  const squad = teamService.getSquad(portugal.id);
  const lineup = teamService.getLineup(portugal.id);

  return (
    <section className="relative overflow-hidden rounded-lg border border-gold/30 bg-[linear-gradient(135deg,rgba(214,168,79,.18),rgba(255,255,255,.06))] p-4 shadow-glow">
      <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-pitch/20 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gold">
            <Star size={16} fill="currentColor" aria-hidden /> Portugal im Fokus
          </p>
          <h2 className="mt-2 flex items-center gap-3 text-3xl font-black">
            <FlagIcon team={portugal} className="h-12 w-16" />
            {portugal.name}
          </h2>
          <p className="mt-2 text-white/70">{portugal.groupName} · automatisch als Favorit gesetzt · {portugalMatches.length} Spiele im Kalender verfügbar</p>
        </div>
        <DataStatusBadge status={squad?.status ?? "mock"} />
      </div>

      <div className="relative mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <article className="rounded-lg border border-white/10 bg-night/60 p-4">
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/55">
            <CalendarDays size={16} aria-hidden /> Nächstes Portugal-Spiel
          </p>
          {nextPortugalMatch ? (
            <>
              <p className="mt-2 text-xl font-black">
                {matchService.getTeamLabel(nextPortugalMatch.teamAId)} vs {matchService.getTeamLabel(nextPortugalMatch.teamBId)}
              </p>
              <p className="mt-1 text-white/65">
                {formatLocalDate(nextPortugalMatch.dateUtc, settings.timezone)} · {formatLocalTime(nextPortugalMatch.dateUtc, settings.timezone)} · {nextPortugalMatch.stadium}
              </p>
            </>
          ) : (
            <p className="mt-2 text-white/65">Noch kein kommendes Portugal-Spiel in den Daten.</p>
          )}
        </article>
        <div className="flex flex-col gap-2">
          <CalendarExportButton matches={portugalMatches} settings={settings} label="Portugal exportieren" filename="jorge-wm-2026-portugal.ics" />
          <button type="button" onClick={onOpenTeams} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/15">
            <ShieldCheck size={18} aria-hidden /> Kader ansehen
          </button>
        </div>
      </div>

      <p className="relative mt-3 text-sm text-white/55">Kaderstatus: {squad?.status === "official" ? "offiziell" : "vorläufig"} · Aufstellung: {lineup?.formation ?? "noch nicht offiziell bekannt"}</p>
    </section>
  );
}
