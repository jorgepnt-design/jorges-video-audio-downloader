import { Search, Star, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { Group, Match, Team } from "../types";
import { FlagIcon } from "./FlagIcon";
import { TeamSquadPanel } from "./TeamSquadPanel";

interface Props {
  groups: Group[];
  matches: Match[];
  teams: Team[];
  favoriteTeams: Team[];
  favoriteIds: string[];
  maxFavorites: number;
  onToggle: (teamId: string) => void;
  onReset: () => void;
}

export function TeamSelector({ groups, matches, teams, favoriteTeams, favoriteIds, maxFavorites, onToggle, onReset }: Props) {
  const [search, setSearch] = useState("");
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  const full = favoriteIds.length >= maxFavorites;
  const visibleTeams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teams;
    return teams.filter((team) => `${team.name} ${team.fifaCode} ${team.groupName}`.toLowerCase().includes(query));
  }, [search, teams]);
  const openTeam = teams.find((team) => team.id === openTeamId);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-white/10 bg-white/8 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">Ausgewählt: {favoriteIds.length} von {maxFavorites}</p>
            <p className="mt-1 text-sm text-white/55">Tippe ein goldenes Team erneut an, um es zu entfernen.</p>
          </div>
          {favoriteIds.length > 0 && (
            <button type="button" onClick={onReset} className="rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15">
              Auswahl zurücksetzen
            </button>
          )}
          {full && <p className="rounded-md bg-ember/20 px-3 py-2 text-sm text-red-100">Limit erreicht. Entferne ein Team, um ein anderes zu wählen.</p>}
        </div>

        {favoriteTeams.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {favoriteTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => onToggle(team.id)}
                className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/15 px-3 py-2 text-sm font-bold text-gold"
              >
                <FlagIcon team={team} />
                {team.name}
                <X size={15} aria-hidden />
              </button>
            ))}
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-night px-3 py-3 text-white">
          <Search size={18} className="text-white/45" aria-hidden />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Team suchen"
            className="w-full bg-transparent outline-none placeholder:text-white/40"
          />
        </label>
      </div>

      {openTeam && (
        <TeamSquadPanel
          team={openTeam}
          matches={matches.filter((match) => match.teamAId === openTeam.id || match.teamBId === openTeam.id)}
          isFavorite={favoriteIds.includes(openTeam.id)}
          onToggleFavorite={() => onToggle(openTeam.id)}
          onClose={() => setOpenTeamId(null)}
        />
      )}

      {groups.map((group) => {
        const groupTeams = visibleTeams.filter((team) => group.teams.includes(team.id));
        if (groupTeams.length === 0) return null;
        return (
          <section key={group.id} className="rounded-lg border border-white/10 bg-white/7 p-4">
            <h3 className="mb-3 text-xl font-black">{group.name}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {groupTeams.map((team) => {
                const selected = favoriteIds.includes(team.id);
                const disabled = full && !selected;
                return (
                  <article
                    key={team.id}
                    className={`flex min-h-28 items-center justify-between gap-3 rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-gold bg-gold text-night shadow-glow"
                        : disabled
                          ? "border-white/10 bg-night/70 opacity-45"
                          : "border-white/10 bg-night/70 hover:border-gold/60"
                    }`}
                  >
                    <span>
                      <span className="block"><FlagIcon team={team} className="h-8 w-11" /></span>
                      <span className="mt-2 block font-bold">{team.name}</span>
                      <span className={`text-xs ${selected ? "text-night/65" : "text-white/50"}`}>{team.fifaCode}</span>
                    </span>
                    <span className="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggle(team.id)}
                        className={`rounded-md p-2 ${selected ? "bg-night/10" : "bg-white/10 text-white hover:bg-white/15 disabled:cursor-not-allowed"}`}
                        aria-label={selected ? `${team.name} aus Favoriten entfernen` : `${team.name} als Favorit wählen`}
                      >
                        <Star fill={selected ? "currentColor" : "none"} size={20} aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenTeamId(team.id)}
                        className={`rounded-md p-2 ${selected ? "bg-night/10" : "bg-white/10 text-white hover:bg-white/15"}`}
                        aria-label={`${team.name} Kader anzeigen`}
                      >
                        <Users size={20} aria-hidden />
                      </button>
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
