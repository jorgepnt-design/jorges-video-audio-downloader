import { useState } from "react";
import { Layout } from "./components/Layout";
import { LiveDataAutoRefresh } from "./components/LiveDataAutoRefresh";
import type { PageId } from "./components/Navigation";
import { useFavorites } from "./hooks/useFavorites";
import { useMatches } from "./hooks/useMatches";
import { usePredictions } from "./hooks/usePredictions";
import { useTeams } from "./hooks/useTeams";
import { useUserSettings } from "./hooks/useUserSettings";
import { Dashboard } from "./pages/Dashboard";
import { GroupsPage } from "./pages/GroupsPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { SchedulePage } from "./pages/SchedulePage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeamsPage } from "./pages/TeamsPage";

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const { teams, groups } = useTeams();
  const { favoriteTeams, favoriteIds, maxFavorites, toggleFavorite, resetFavorites } = useFavorites();
  const { predictions, savePrediction } = usePredictions();
  const { settings, setSettings } = useUserSettings();
  const { matches, filteredMatches, favoriteMatches, nextFavoriteMatch, filters, setFilters } = useMatches(favoriteTeams);

  return (
    <Layout page={page} onNavigate={setPage}>
      <LiveDataAutoRefresh />
      {page === "dashboard" && (
        <Dashboard
          favoriteTeams={favoriteTeams}
          favoriteMatches={favoriteMatches}
          nextFavoriteMatch={nextFavoriteMatch}
          predictions={predictions}
          settings={settings}
          onNavigate={setPage}
        />
      )}
      {page === "teams" && (
        <TeamsPage
          groups={groups}
          teams={teams}
          favoriteTeams={favoriteTeams}
          favoriteIds={favoriteIds}
          maxFavorites={maxFavorites}
          onToggle={toggleFavorite}
          onReset={resetFavorites}
        />
      )}
      {page === "schedule" && (
        <SchedulePage
          groups={groups}
          matches={filteredMatches}
          allMatches={matches}
          favoriteMatches={favoriteMatches}
          favoriteTeams={favoriteTeams}
          predictions={predictions}
          settings={settings}
          filters={filters}
          setFilters={setFilters}
        />
      )}
      {page === "groups" && <GroupsPage groups={groups} teams={teams} favoriteIds={favoriteIds} />}
      {page === "predictions" && (
        <PredictionsPage matches={matches} favoriteTeams={favoriteTeams} predictions={predictions} settings={settings} onSave={savePrediction} />
      )}
      {page === "settings" && <SettingsPage settings={settings} onChange={setSettings} calendarMatches={favoriteMatches} />}
    </Layout>
  );
}
