import { teams } from "./teams";
import type { Player, PlayerPosition, TeamLineup, TeamSquad } from "../types";

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Official 2026 World Cup squads and match lineups are not final yet.
// Replace this generator with official player imports when squads, shirt numbers and lineups are confirmed.
const slots: PlayerPosition[] = [
  "GK",
  "GK",
  "GK",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "MID",
  "MID",
  "MID",
  "MID",
  "MID",
  "MID",
  "MID",
  "MID",
  "FWD",
  "FWD",
  "FWD",
  "FWD",
];

const createPlayers = (teamId: string): Player[] =>
  slots.map((position, index) => ({
    id: `${teamId}-player-${String(index + 1).padStart(2, "0")}`,
    teamId,
    name: `Mock Spieler ${String(index + 1).padStart(2, "0")}`,
    shirtNumber: index + 1,
    position,
    club: "TODO_OFFICIAL_DATA",
    status: "mock",
  }));

export const squads: TeamSquad[] = teams.map((team) => ({
  teamId: team.id,
  updatedAt: "2026-05-19T00:00:00Z",
  status: "mock",
  note: "Vorläufiger Mock-Kader. Offizielle WM-2026-Kader können hier zentral ersetzt werden.",
  players: createPlayers(team.id),
}));

export const lineups: TeamLineup[] = teams.map((team) => ({
  teamId: team.id,
  formation: null,
  status: "mock",
  updatedAt: "2026-05-19T00:00:00Z",
  startingPlayerIds: [],
  benchPlayerIds: [],
  unavailablePlayerIds: [],
  note: "Startaufstellung noch nicht offiziell bekannt. Sobald sie bekannt ist, werden Formation, Startelf und Bank hier sichtbar.",
}));
