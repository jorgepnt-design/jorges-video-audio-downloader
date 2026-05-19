import type { Team } from "../types";

export function FavoriteTeams({ teams }: { teams: Team[] }) {
  if (teams.length === 0) return <p className="text-white/65">Noch keine Favoriten ausgewählt.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {teams.map((team) => (
        <span key={team.id} className="rounded-md border border-gold/40 bg-gold/15 px-3 py-2 text-sm font-semibold text-gold">
          {team.flag} {team.name}
        </span>
      ))}
    </div>
  );
}
