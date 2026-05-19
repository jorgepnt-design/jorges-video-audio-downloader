import { lineups, squads } from "../data/squads";
import type { Match, TeamLineup, TeamSquad } from "../types";
import { liveDataService } from "./liveDataService";
import { matchService } from "./matchService";

export interface LiveDataResponse {
  matches: Match[];
  squads: TeamSquad[];
  lineups: TeamLineup[];
  source: "mock" | "api";
  updatedAt: string;
}

const apiBaseUrl = import.meta.env.VITE_FOOTBALL_API_BASE_URL as string | undefined;
const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY as string | undefined;

export const footballApi = {
  async fetchLiveData(): Promise<LiveDataResponse> {
    if (apiBaseUrl && apiKey) {
      // The endpoint should return LiveDataResponse-shaped JSON. Provider-specific mapping belongs here.
      const response = await fetch(apiBaseUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error(`Live data request failed: ${response.status}`);
      const data = (await response.json()) as LiveDataResponse;
      const normalized = { ...data, source: "api" as const, updatedAt: data.updatedAt ?? new Date().toISOString() };
      liveDataService.saveLiveData(normalized);
      return normalized;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    const mockResponse = {
      matches: matchService.getMatches(),
      squads,
      lineups,
      source: "mock",
      updatedAt: new Date().toISOString(),
    } satisfies LiveDataResponse;
    liveDataService.saveLiveData(mockResponse);
    return mockResponse;
  },
};
