import type { Match } from "../types";
import { matchService } from "./matchService";

export interface LiveDataResponse {
  matches: Match[];
  source: "mock" | "api";
  updatedAt: string;
}

export const footballApi = {
  async fetchLiveData(): Promise<LiveDataResponse> {
    // TODO: Replace with external football API using VITE_FOOTBALL_API_KEY.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      matches: matchService.getMatches(),
      source: "mock",
      updatedAt: new Date().toISOString(),
    };
  },
};
