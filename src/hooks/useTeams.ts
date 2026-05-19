import { useMemo } from "react";
import { teamService } from "../services/teamService";

export const useTeams = () =>
  useMemo(
    () => ({
      teams: teamService.getTeams(),
      groups: teamService.getGroups(),
    }),
    [],
  );
