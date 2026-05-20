import { CalendarCheck, Star, Trophy } from "lucide-react";
import { FlagIcon } from "./FlagIcon";
import { matchService } from "../services/matchService";
import { teamService } from "../services/teamService";
import type { Match, Team } from "../types";
import { formatLocalDate, formatLocalTime } from "../utils/date";

interface Props {
  favoriteTeams: Team[];
  favoriteMatches: Match[];
  nextFavoriteMatch?: Match;
}

export function StatsPanel({ favoriteTeams, favoriteMatches, nextFavoriteMatch }: Props) {
  const groupMatches = favoriteMatches.filter((match) => match.round === "Gruppenphase").length;
  const knockoutMatches = favoriteMatches.filter((match) => match.round !== "Gruppenphase").length;
  const nextTeamA = nextFavoriteMatch ? teamService.getTeamById(nextFavoriteMatch.teamAId) : undefined;
  const nextTeamB = nextFavoriteMatch ? teamService.getTeamById(nextFavoriteMatch.teamBId) : undefined;
  const stats = [
    { label: "Favoriten", value: favoriteTeams.length, icon: Star },
    { label: "Meine Spiele", value: favoriteMatches.length, icon: CalendarCheck },
    { label: "Gruppenspiele", value: groupMatches, icon: Trophy },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon }) => (
        <article key={label} className="rounded-lg border border-white/10 bg-white/8 p-4">
          <Icon className="mb-3 text-gold" size={22} aria-hidden />
          <p className="text-3xl font-black">{value}</p>
          <p className="text-sm text-white/65">{label}</p>
        </article>
      ))}
      <article className="rounded-lg border border-gold/30 bg-gold/10 p-4 sm:col-span-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">Nächstes Favoriten-Spiel</p>
        {nextFavoriteMatch ? (
          <p className="mt-2 text-lg font-bold">
            <span className="inline-flex flex-wrap items-center gap-2">
              {nextTeamA && <FlagIcon team={nextTeamA} />}
              {matchService.getTeamLabel(nextFavoriteMatch.teamAId)}
              <span>vs</span>
              {nextTeamB && <FlagIcon team={nextTeamB} />}
              {matchService.getTeamLabel(nextFavoriteMatch.teamBId)}
            </span>{" "}
            ·{" "}
            {formatLocalDate(nextFavoriteMatch.dateUtc)} · {formatLocalTime(nextFavoriteMatch.dateUtc)}
          </p>
        ) : (
          <p className="mt-2 text-white/70">Wähle Favoriten aus, um deinen persönlichen Spielplan zu starten.</p>
        )}
        <p className="mt-2 text-sm text-white/55">Mögliche K.O.-Spiele mit Favoriten: {knockoutMatches}</p>
      </article>
    </section>
  );
}
