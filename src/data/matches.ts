import type { Group, Match, Round } from "../types";
import { groups } from "./groups";
import { stadiums } from "./stadiums";

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Dates are realistic placeholders and not official fixtures. Import official data here later.
const getVenue = (index: number) => stadiums[index % stadiums.length];

const makeMatch = (
  id: string,
  round: Round,
  dateUtc: string,
  teamAId: string,
  teamBId: string,
  stadiumIndex: number,
  group?: Group,
): Match => {
  const venue = getVenue(stadiumIndex);

  return {
    id,
    round,
    group: group?.id,
    groupName: group?.name,
    dateUtc,
    teamAId,
    teamBId,
    stadium: venue.name,
    city: venue.city,
    country: venue.country,
    status: "scheduled",
    scoreA: null,
    scoreB: null,
    liveMinute: null,
  };
};

const groupMatches: Match[] = [];
const pairings = [
  [0, 1],
  [2, 3],
  [0, 2],
  [1, 3],
  [0, 3],
  [1, 2],
];

groups.forEach((group, groupIndex) => {
  pairings.forEach(([a, b], pairingIndex) => {
    const dayOffset = groupIndex + pairingIndex * 4;
    const hour = [16, 19, 22][pairingIndex % 3];
    const date = new Date(Date.UTC(2026, 5, 11 + dayOffset, hour, 0, 0));
    groupMatches.push(
      makeMatch(
        `match-${String(groupMatches.length + 1).padStart(3, "0")}`,
        "Gruppenphase",
        date.toISOString(),
        group.teams[a],
        group.teams[b],
        groupMatches.length,
        group,
      ),
    );
  });
});

const knockouts: Match[] = [
  makeMatch("match-073", "Sechzehntelfinale", "2026-06-28T19:00:00Z", "winner-a", "third-cde", 0),
  makeMatch("match-074", "Sechzehntelfinale", "2026-06-28T22:00:00Z", "winner-b", "third-fgh", 1),
  makeMatch("match-075", "Achtelfinale", "2026-07-04T19:00:00Z", "winner-073", "winner-074", 2),
  makeMatch("match-076", "Achtelfinale", "2026-07-04T22:00:00Z", "winner-075", "runner-a", 3),
  makeMatch("match-077", "Viertelfinale", "2026-07-09T20:00:00Z", "winner-r16-1", "winner-r16-2", 4),
  makeMatch("match-078", "Viertelfinale", "2026-07-10T20:00:00Z", "winner-r16-3", "winner-r16-4", 5),
  makeMatch("match-079", "Halbfinale", "2026-07-14T20:00:00Z", "winner-qf-1", "winner-qf-2", 0),
  makeMatch("match-080", "Halbfinale", "2026-07-15T20:00:00Z", "winner-qf-3", "winner-qf-4", 1),
  makeMatch("match-081", "Spiel um Platz 3", "2026-07-18T20:00:00Z", "loser-sf-1", "loser-sf-2", 6),
  makeMatch("match-082", "Finale", "2026-07-19T20:00:00Z", "winner-sf-1", "winner-sf-2", 0),
];

export const matches: Match[] = [...groupMatches, ...knockouts];
