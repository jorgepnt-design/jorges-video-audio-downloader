import type { Match, Prediction, Team, UserSettings } from "../types";
import { MatchCard } from "./MatchCard";
import { PredictionForm } from "./PredictionForm";

interface Props {
  matches: Match[];
  favoriteTeams: Team[];
  predictions: Prediction[];
  settings: UserSettings;
  onSave: (matchId: string, scoreA: number, scoreB: number) => void;
}

export function PredictionList({ matches, favoriteTeams, predictions, settings, onSave }: Props) {
  const favoriteIds = new Set(favoriteTeams.map((team) => team.id));
  return (
    <div className="grid gap-4">
      {matches.map((match) => {
        const prediction = predictions.find((item) => item.matchId === match.id);
        const isFavorite = favoriteIds.has(match.teamAId) || favoriteIds.has(match.teamBId);
        return (
          <MatchCard key={match.id} match={match} isFavorite={isFavorite} prediction={prediction} timezone={settings.timezone}>
            <PredictionForm match={match} prediction={prediction} onSave={onSave} />
          </MatchCard>
        );
      })}
    </div>
  );
}
