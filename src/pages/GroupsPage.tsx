import { GroupTable } from "../components/GroupTable";
import { SectionHeader } from "../components/SectionHeader";
import type { Group, Team } from "../types";

export function GroupsPage({ groups, teams, favoriteIds }: { groups: Group[]; teams: Team[]; favoriteIds: string[] }) {
  return (
    <>
      <SectionHeader eyebrow="Gruppen" title="12 Gruppen mit Tabellen-Platzhalter" description="Tabellenwerte sind bewusst als Mock-Struktur angelegt und können später durch API- oder Datenbankwerte ersetzt werden." />
      <GroupTable groups={groups} teams={teams} favoriteIds={favoriteIds} />
    </>
  );
}
