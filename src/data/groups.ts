import type { Group, GroupId } from "../types";
import { teams } from "./teams";

export const groupOrder: GroupId[] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

// MOCK_DATA / TODO_OFFICIAL_DATA:
// Every group currently contains exactly 4 team IDs. Replace IDs here when official groups change.
export const groups: Group[] = groupOrder.map((id) => ({
  id,
  name: `Gruppe ${id}`,
  teams: teams.filter((team) => team.group === id).map((team) => team.id),
}));
