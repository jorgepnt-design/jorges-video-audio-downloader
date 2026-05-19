import { groups } from "../data/groups";
import { lineups, squads } from "../data/squads";
import { teams } from "../data/teams";
import type { Group, GroupId, Team, TeamLineup, TeamSquad } from "../types";
import { liveDataService } from "./liveDataService";

export const teamService = {
  getTeams(): Team[] {
    return teams;
  },
  getGroups(): Group[] {
    return groups;
  },
  getTeamsByGroup(groupId: GroupId): Team[] {
    return teams.filter((team) => team.group === groupId);
  },
  getTeamById(teamId: string): Team | undefined {
    return teams.find((team) => team.id === teamId);
  },
  getTeamName(teamId: string): string {
    return this.getTeamById(teamId)?.name ?? teamId;
  },
  getSquad(teamId: string): TeamSquad | undefined {
    return liveDataService.getSquad(teamId) ?? squads.find((squad) => squad.teamId === teamId);
  },
  getLineup(teamId: string): TeamLineup | undefined {
    return liveDataService.getLineup(teamId) ?? lineups.find((lineup) => lineup.teamId === teamId);
  },
};
