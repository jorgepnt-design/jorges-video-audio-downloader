import { useState } from "react";
import { FlagIcon } from "./FlagIcon";
import { matchService } from "../services/matchService";
import { teamService } from "../services/teamService";
import type { Match, Prediction } from "../types";

interface Props {
  match: Match;
  prediction?: Prediction;
  onSave: (matchId: string, scoreA: number, scoreB: number) => void;
}

export function PredictionForm({ match, prediction, onSave }: Props) {
  const [scoreA, setScoreA] = useState(prediction?.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(prediction?.scoreB ?? 0);
  const teamA = teamService.getTeamById(match.teamAId);
  const teamB = teamService.getTeamById(match.teamBId);

  return (
    <form
      className="flex flex-wrap items-end gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(match.id, scoreA, scoreB);
      }}
    >
      <label className="text-sm text-white/65">
        <span className="inline-flex items-center gap-2">{teamA && <FlagIcon team={teamA} />} {matchService.getTeamLabel(match.teamAId)}</span>
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
        <span className="inline-flex items-center gap-2">{teamB && <FlagIcon team={teamB} />} {matchService.getTeamLabel(match.teamBId)}</span>
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
