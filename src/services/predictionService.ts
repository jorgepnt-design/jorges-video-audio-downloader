import { localUser } from "../data/mockUser";
import type { Prediction } from "../types";
import { storageService } from "./storageService";

const KEY = "predictions";

export const predictionService = {
  getPredictions(): Prediction[] {
    return storageService.get<Prediction[]>(KEY, []);
  },
  savePrediction(matchId: string, scoreA: number, scoreB: number): Prediction {
    const now = new Date().toISOString();
    const predictions = this.getPredictions();
    const existing = predictions.find((prediction) => prediction.matchId === matchId);
    const next: Prediction = {
      id: existing?.id ?? crypto.randomUUID(),
      userId: localUser.id,
      matchId,
      scoreA,
      scoreB,
      points: existing?.points ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    storageService.set(
      KEY,
      existing ? predictions.map((prediction) => (prediction.matchId === matchId ? next : prediction)) : [...predictions, next],
    );
    return next;
  },
  clear(): void {
    storageService.remove(KEY);
  },
};
