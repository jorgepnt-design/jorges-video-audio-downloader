import type { Match, TeamLineup, TeamSquad } from "../types";
import { storageService } from "./storageService";

export interface CachedLiveData {
  matches: Match[];
  squads: TeamSquad[];
  lineups: TeamLineup[];
  source: "mock" | "api";
  updatedAt: string;
}

const KEY = "live-data";

export const liveDataService = {
  getCachedLiveData(): CachedLiveData | null {
    return storageService.get<CachedLiveData | null>(KEY, null);
  },
  saveLiveData(data: CachedLiveData): void {
    storageService.set(KEY, data);
    window.dispatchEvent(new CustomEvent("wm2026:live-data-updated", { detail: data }));
  },
  getSquad(teamId: string): TeamSquad | undefined {
    return this.getCachedLiveData()?.squads.find((squad) => squad.teamId === teamId);
  },
  getLineup(teamId: string): TeamLineup | undefined {
    return this.getCachedLiveData()?.lineups.find((lineup) => lineup.teamId === teamId);
  },
};
