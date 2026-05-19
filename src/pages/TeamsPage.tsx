import { SectionHeader } from "../components/SectionHeader";
import { TeamSelector } from "../components/TeamSelector";
import type { Group, Team } from "../types";

interface Props {
  groups: Group[];
  teams: Team[];
  favoriteTeams: Team[];
  favoriteIds: string[];
  maxFavorites: number;
  onToggle: (teamId: string) => void;
  onReset: () => void;
}

export function TeamsPage(props: Props) {
  return (
    <>
      <SectionHeader eyebrow="Team-Auswahl" title="Wähle bis zu acht Lieblingsmannschaften" description="Die Auswahl bleibt lokal gespeichert und steuert Spielplan, Statistiken, Kalenderexport und Favoriten-Markierungen." />
      <TeamSelector {...props} />
    </>
  );
}
