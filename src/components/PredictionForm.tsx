import { useState } from "react";
import { matchService } from "../services/matchService";
import type { Match, Prediction } from "../types";

interface Props {
  match: Match;
  prediction?: Prediction;
  onSave: (matchId: string, scoreA: number, scoreB: number) => void;
}

export function PredictionForm({ match, prediction, onSave }: Props) {
  const [scoreA, setScoreA] = useState(prediction?.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(prediction?.scoreB ?? 0);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(match.id, scoreA, scoreB);
      }}
    >
      <label className="text-sm text-white/65">
        {matchService.getTeamDisplayLabel(match.teamAId)}
        <input
          type="number"
          min="0"
          max="20"
          value={scoreA}
          onChange={(event) => setScoreA(Number(event.target.value))}
          className="mt-1 block w-20 rounded-md border border-white/10 bg-night px-3 py-2 text-white"
        />
      </label>
      <label className="text-sm text-white/65">
        {matchService.getTeamDisplayLabel(match.teamBId)}
        <input
          type="number"
          min="0"
          max="20"
          value={scoreB}
          onChange={(event) => setScoreB(Number(event.target.value))}
          className="mt-1 block w-20 rounded-md border border-white/10 bg-night px-3 py-2 text-white"
        />
      </label>
      <button type="submit" className="rounded-md bg-gold px-4 py-2 font-bold text-night">
        Tipp speichern
      </button>
      {prediction && <span className="rounded-md bg-pitch/20 px-3 py-2 text-sm font-bold text-green-100">Tipp gespeichert</span>}
    </form>
  );
}
