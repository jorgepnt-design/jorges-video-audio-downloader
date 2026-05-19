import { useState } from "react";
import { predictionService } from "../services/predictionService";

export const usePredictions = () => {
  const [predictions, setPredictions] = useState(() => predictionService.getPredictions());

  const savePrediction = (matchId: string, scoreA: number, scoreB: number) => {
    predictionService.savePrediction(matchId, scoreA, scoreB);
    setPredictions(predictionService.getPredictions());
  };

  const clearPredictions = () => {
    predictionService.clear();
    setPredictions([]);
  };

  return { predictions, savePrediction, clearPredictions };
};
