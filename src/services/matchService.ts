import { matches as mockMatches } from "../data/matches";
import type { EnrichedMatch, Match, MatchFiltersState, Team } from "../types";
import { teamService } from "./teamService";

const placeholderNames: Record<string, string> = {
  tbd: "Noch offen",
  "winner-a": "Sieger Gruppe A",
  "winner-b": "Sieger Gruppe B",
  "third-cde": "Dritter Gruppe C/D/E",
  "third-fgh": "Dritter Gruppe F/G/H",
  "winner-073": "Sieger Spiel 73",
  "winner-074": "Sieger Spiel 74",
  "winner-075": "Sieger Spiel 75",
  "runner-a": "Zweiter Gruppe A",
  "winner-r16-1": "Sieger Achtelfinale 1",
  "winner-r16-2": "Sieger Achtelfinale 2",
  "winner-r16-3": "Sieger Achtelfinale 3",
  "winner-r16-4": "Sieger Achtelfinale 4",
  "winner-qf-1": "Sieger Viertelfinale 1",
  "winner-qf-2": "Sieger Viertelfinale 2",
  "winner-qf-3": "Sieger Viertelfinale 3",
  "winner-qf-4": "Sieger Viertelfinale 4",
  "loser-sf-1": "Verlierer Halbfinale 1",
  "loser-sf-2": "Verlierer Halbfinale 2",
  "winner-sf-1": "Sieger Halbfinale 1",
  "winner-sf-2": "Sieger Halbfinale 2",
};

const teamLabel = (teamId: string) => teamService.getTeamById(teamId)?.name ?? placeholderNames[teamId] ?? teamId;
const teamFlag = (teamId: string) => teamService.getTeamById(teamId)?.flag;
const teamDisplayLabel = (teamId: string) => {
  const team = teamService.getTeamById(teamId);
  return team ? `${team.flag} ${team.name}` : placeholderNames[teamId] ?? teamId;
};
const favoriteIds = (favoriteTeams: Team[]) => new Set(favoriteTeams.map((team) => team.id));

const isFavoriteMatch = (match: Match, favoriteTeams: Team[]) => {
  const ids = favoriteIds(favoriteTeams);
  return ids.has(match.teamAId) || ids.has(match.teamBId);
};

const enrich = (match: Match): EnrichedMatch => ({
  ...match,
  teamAName: teamLabel(match.teamAId),
  teamBName: teamLabel(match.teamBId),
  teamAFlag: teamFlag(match.teamAId),
  teamBFlag: teamFlag(match.teamBId),
});

export const matchService = {
  getMatches(): Match[] {
    return mockMatches;
  },
  getEnrichedMatches(matches: Match[] = mockMatches): EnrichedMatch[] {
    return matches.map(enrich);
  },
  getFavoriteMatches(favoriteTeams: Team[]): Match[] {
    return mockMatches.filter((match) => isFavoriteMatch(match, favoriteTeams));
  },
  getTeamMatches(teamId: string): Match[] {
    return mockMatches.filter((match) => match.teamAId === teamId || match.teamBId === teamId);
  },
  getNextFavoriteMatch(favoriteTeams: Team[]): Match | undefined {
    const now = Date.now();
    return this.getFavoriteMatches(favoriteTeams)
      .filter((match) => new Date(match.dateUtc).getTime() >= now)
      .sort((a, b) => new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime())[0];
  },
  filterMatches(filters: MatchFiltersState, favoriteTeams: Team[]): Match[] {
    return mockMatches.filter((match) => {
      const favorite = isFavoriteMatch(match, favoriteTeams);
      const labels = `${teamLabel(match.teamAId)} ${teamLabel(match.teamBId)}`.toLowerCase();
      const byRound =
        filters.round === "Alle Spiele" ||
        (filters.round === "Nur meine Teams" ? favorite : match.round === filters.round);
      const bySearch = !filters.search || labels.includes(filters.search.trim().toLowerCase());
      const byGroup = !filters.group || match.group === filters.group;
      const byDate = !filters.date || match.dateUtc.slice(0, 10) === filters.date;
      const byStatus = !filters.status || match.status === filters.status;
      return byRound && bySearch && byGroup && byDate && byStatus;
    });
  },
  getTeamLabel: teamLabel,
  getTeamDisplayLabel: teamDisplayLabel,
  isFavoriteMatch,
  enrich,
};
