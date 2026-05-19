import { ArrowRight, CalendarDays, Shield, Sparkles } from "lucide-react";
import type { PageId } from "../components/Navigation";
import { CalendarExportButton } from "../components/CalendarExportButton";
import { CountdownCard } from "../components/CountdownCard";
import { FavoriteTeams } from "../components/FavoriteTeams";
import { LiveUpdateButton } from "../components/LiveUpdateButton";
import { PWAInstallPrompt } from "../components/PWAInstallPrompt";
import { StatsPanel } from "../components/StatsPanel";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { matchService } from "../services/matchService";
import type { Match, Prediction, Team, UserSettings } from "../types";
import { formatLocalDate, formatLocalTime } from "../utils/date";

interface Props {
  favoriteTeams: Team[];
  favoriteMatches: Match[];
  nextFavoriteMatch?: Match;
  predictions: Prediction[];
  settings: UserSettings;
  onNavigate: (page: PageId) => void;
}

export function Dashboard({ favoriteTeams, favoriteMatches, nextFavoriteMatch, predictions, settings, onNavigate }: Props) {
  const online = useOnlineStatus();

  return (
    <div className="space-y-6">
      {!online && (
        <div className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold text-gold">
          Offline-Modus aktiv. Favoriten, Tipps und Spielplan bleiben lokal verfügbar.
        </div>
      )}

      <section className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(214,168,79,.24),transparent_28rem),linear-gradient(135deg,rgba(12,26,59,.95),rgba(3,9,24,.98))] p-5 shadow-2xl md:p-7">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(90deg,rgba(49,211,127,.12),rgba(55,132,255,.12),rgba(201,65,61,.12))]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-3 py-1 text-sm font-bold text-gold">
              <Sparkles size={15} aria-hidden /> WM 2026 Companion
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Dein persönlicher WM 2026 Spielplan</h1>
            <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">
              Favoriten wählen, Spiele verfolgen, Tipps speichern und deine Termine als Kalender exportieren. Lokal startklar, später bereit für Login,
              Cloud-Sync und Live-Daten.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => onNavigate("teams")} className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-3 font-bold text-night">
                <Shield size={18} aria-hidden /> Team-Auswahl
              </button>
              <button type="button" onClick={() => onNavigate("schedule")} className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-4 py-3 font-bold text-white">
                <CalendarDays size={18} aria-hidden /> Mein Spielplan
              </button>
              <CalendarExportButton matches={favoriteMatches} settings={settings} />
              <PWAInstallPrompt />
            </div>
          </div>

          <div className="space-y-3">
            <article className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-wide text-gold">Nächstes Spiel deiner Favoriten</p>
              {nextFavoriteMatch ? (
                <>
                  <h2 className="mt-3 text-2xl font-black">
                    {matchService.getTeamDisplayLabel(nextFavoriteMatch.teamAId)} vs {matchService.getTeamDisplayLabel(nextFavoriteMatch.teamBId)}
                  </h2>
                  <p className="mt-2 text-white/65">
                    {formatLocalDate(nextFavoriteMatch.dateUtc, settings.timezone)} · {formatLocalTime(nextFavoriteMatch.dateUtc, settings.timezone)} ·{" "}
                    {nextFavoriteMatch.stadium}
                  </p>
                </>
              ) : (
                <p className="mt-3 text-white/70">Noch keine Favoriten ausgewählt. Starte mit bis zu 8 Teams.</p>
              )}
            </article>
            <CountdownCard dateUtc={nextFavoriteMatch?.dateUtc} />
          </div>
        </div>
      </section>

      <StatsPanel favoriteTeams={favoriteTeams} favoriteMatches={favoriteMatches} nextFavoriteMatch={nextFavoriteMatch} predictions={predictions} />

      <section className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-white/10 bg-white/7 p-4">
          <h3 className="mb-3 text-xl font-black">Favoriten</h3>
          <FavoriteTeams teams={favoriteTeams} />
        </div>
        <button type="button" onClick={() => onNavigate("predictions")} className="flex items-center justify-center gap-2 rounded-lg border border-gold/30 bg-gold/10 px-5 py-4 font-bold text-gold">
          Zu den Tipps <ArrowRight size={18} aria-hidden />
        </button>
      </section>

      <LiveUpdateButton />
    </div>
  );
}
