import type { Standing } from "../types";
import { teams } from "./teams";

export const standings: Standing[] = teams.map((team) => ({
  teamId: team.id,
  group: team.group,
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  points: 0,
}));
