import { useMemo, useState } from "react";
import { matchService } from "../services/matchService";
import type { MatchFiltersState, Team } from "../types";

const defaultFilters: MatchFiltersState = {
  round: "Alle Spiele",
  search: "",
  group: "",
  date: "",
  status: "",
};

export const useMatches = (favoriteTeams: Team[]) => {
  const [filters, setFilters] = useState<MatchFiltersState>(defaultFilters);
  const matches = useMemo(() => matchService.getMatches(), []);
  const filteredMatches = useMemo(() => matchService.filterMatches(filters, favoriteTeams), [filters, favoriteTeams]);
  const favoriteMatches = useMemo(() => matchService.getFavoriteMatches(favoriteTeams), [favoriteTeams]);
  const nextFavoriteMatch = useMemo(() => matchService.getNextFavoriteMatch(favoriteTeams), [favoriteTeams]);

  return {
    matches,
    filteredMatches,
    favoriteMatches,
    nextFavoriteMatch,
    filters,
    setFilters,
    isFavoriteMatch: (matchId: string) => {
      const match = matches.find((item) => item.id === matchId);
      return match ? matchService.isFavoriteMatch(match, favoriteTeams) : false;
    },
  };
};
