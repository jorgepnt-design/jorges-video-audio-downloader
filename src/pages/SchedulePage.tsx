import { CalendarExportButton } from "../components/CalendarExportButton";
import { LiveUpdateButton } from "../components/LiveUpdateButton";
import { MatchFilters } from "../components/MatchFilters";
import { MySchedule } from "../components/MySchedule";
import { SectionHeader } from "../components/SectionHeader";
import type { Group, Match, MatchFiltersState, Prediction, Team, UserSettings } from "../types";

interface Props {
  groups: Group[];
  matches: Match[];
  allMatches: Match[];
  favoriteMatches: Match[];
  favoriteTeams: Team[];
  predictions: Prediction[];
  settings: UserSettings;
  filters: MatchFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<MatchFiltersState>>;
}

export function SchedulePage({ groups, matches, allMatches, favoriteMatches, favoriteTeams, predictions, settings, filters, setFilters }: Props) {
  return (
    <>
      <SectionHeader eyebrow="Mein Spielplan" title="Alle Spiele, persönlich gefiltert" description="Favoriten werden hervorgehoben, Zeiten werden in deine lokale Zeitzone umgerechnet." />
      <div className="mb-4 flex flex-wrap gap-3">
        <CalendarExportButton matches={favoriteMatches} settings={settings} />
        <CalendarExportButton matches={allMatches} settings={settings} label="Alle Spiele exportieren" />
        <LiveUpdateButton />
      </div>
      <MatchFilters groups={groups} filters={filters} setFilters={setFilters} />
      <MySchedule matches={matches} favoriteTeams={favoriteTeams} predictions={predictions} settings={settings} />
    </>
  );
}
