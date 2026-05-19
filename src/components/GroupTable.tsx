import { Star } from "lucide-react";
import { standings } from "../data/standings";
import type { Group, Team } from "../types";

interface Props {
  groups: Group[];
  teams: Team[];
  favoriteIds: string[];
}

export function GroupTable({ groups, teams, favoriteIds }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {groups.map((group) => (
        <section key={group.id} className="overflow-hidden rounded-lg border border-white/10 bg-white/7">
          <h3 className="border-b border-white/10 px-4 py-3 text-xl font-black">{group.name}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-night/80 text-white/55">
                <tr>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th>P</th>
                  <th>W</th>
                  <th>D</th>
                  <th>L</th>
                  <th>GF</th>
                  <th>GA</th>
                  <th>GD</th>
                  <th>Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.teams.map((teamId) => {
                  const team = teams.find((item) => item.id === teamId);
                  const row = standings.find((standing) => standing.teamId === teamId);
                  if (!team || !row) return null;
                  const favorite = favoriteIds.includes(team.id);
                  return (
                    <tr key={team.id} className={favorite ? "bg-gold/15 text-gold" : "border-t border-white/5"}>
                      <td className="px-4 py-3 font-bold">
                        <span className="mr-2">{team.flag}</span>
                        {team.name}
                        {favorite && <Star className="ml-2 inline" size={15} fill="currentColor" aria-hidden />}
                      </td>
                      <td className="text-center">{row.played}</td>
                      <td className="text-center">{row.won}</td>
                      <td className="text-center">{row.drawn}</td>
                      <td className="text-center">{row.lost}</td>
                      <td className="text-center">{row.goalsFor}</td>
                      <td className="text-center">{row.goalsAgainst}</td>
                      <td className="text-center">{row.goalDifference}</td>
                      <td className="text-center font-black">{row.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
