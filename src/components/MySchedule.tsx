import type { Match, Prediction, Team, UserSettings } from "../types";
import { MatchCard } from "./MatchCard";

interface Props {
  matches: Match[];
  favoriteTeams: Team[];
  predictions: Prediction[];
  settings: UserSettings;
}

export function MySchedule({ matches, favoriteTeams, predictions, settings }: Props) {
  const favoriteIds = new Set(favoriteTeams.map((team) => team.id));
  if (matches.length === 0) {
    return <div className="rounded-lg border border-white/10 bg-white/7 p-6 text-white/65">Keine Spiele für die aktuelle Filterauswahl gefunden.</div>;
  }

  return (
    <div className="grid gap-4">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          isFavorite={favoriteIds.has(match.teamAId) || favoriteIds.has(match.teamBId)}
          prediction={predictions.find((prediction) => prediction.matchId === match.id)}
          timezone={settings.timezone}
        />
      ))}
    </div>
  );
}
