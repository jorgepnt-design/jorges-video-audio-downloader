import { groups } from "../data/groups";
import { standings } from "../data/standings";
import type { Group, GroupId, Standing } from "../types";

export const groupService = {
  getGroups(): Group[] {
    return groups;
  },
  getGroupById(groupId: GroupId): Group | undefined {
    return groups.find((group) => group.id === groupId);
  },
  getStandings(groupId: GroupId): Standing[] {
    return standings.filter((standing) => standing.group === groupId);
  },
};
