import { useMemo, useState } from "react";
import { localUser } from "../data/mockUser";
import { storageService } from "../services/storageService";
import { teamService } from "../services/teamService";
import type { Favorite, Team } from "../types";

const KEY = "favorites";
const VERSION_KEY = "favorites-data-version";
const FAVORITES_DATA_VERSION = "wm2026-mock-v2";
const MAX_FAVORITES = 8;
const REQUIRED_FAVORITE_TEAM_IDS = ["por"];

const createFavorite = (teamId: string): Favorite => ({
  id: crypto.randomUUID(),
  userId: localUser.id,
  teamId,
  createdAt: new Date().toISOString(),
});

const normalizeFavorites = (favorites: Favorite[]) => {
  const unique = favorites.filter(
    (favorite, index, all) => teamService.getTeamById(favorite.teamId) && all.findIndex((item) => item.teamId === favorite.teamId) === index,
  );
  const withRequired = [...REQUIRED_FAVORITE_TEAM_IDS.filter((teamId) => !unique.some((favorite) => favorite.teamId === teamId)).map(createFavorite), ...unique];
  return withRequired.slice(0, MAX_FAVORITES);
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    const storedVersion = storageService.get<string | null>(VERSION_KEY, null);
    if (storedVersion !== FAVORITES_DATA_VERSION) {
      storageService.remove(KEY);
      storageService.set(VERSION_KEY, FAVORITES_DATA_VERSION);
      return [];
    }
    const normalized = normalizeFavorites(storageService.get<Favorite[]>(KEY, []));
    storageService.set(KEY, normalized);
    return normalized;
  });

  const favoriteTeams = useMemo(
    () => favorites.map((favorite) => teamService.getTeamById(favorite.teamId)).filter((team): team is Team => Boolean(team)),
    [favorites],
  );

  const toggleFavorite = (teamId: string) => {
    setFavorites((current) => {
      const exists = current.some((favorite) => favorite.teamId === teamId);
      if (REQUIRED_FAVORITE_TEAM_IDS.includes(teamId) && exists) return current;
      if (!exists && current.length >= MAX_FAVORITES) return current;
      const next = exists
        ? current.filter((favorite) => favorite.teamId !== teamId)
        : [...current, { id: crypto.randomUUID(), userId: localUser.id, teamId, createdAt: new Date().toISOString() }];
      const normalized = normalizeFavorites(next);
      storageService.set(KEY, normalized);
      return normalized;
    });
  };

  const resetFavorites = () => {
    storageService.set(VERSION_KEY, FAVORITES_DATA_VERSION);
    const normalized = normalizeFavorites([]);
    storageService.set(KEY, normalized);
    setFavorites(normalized);
  };

  return {
    favorites,
    favoriteTeams,
    favoriteIds: favorites.map((favorite) => favorite.teamId),
    maxFavorites: MAX_FAVORITES,
    toggleFavorite,
    resetFavorites,
  };
};
