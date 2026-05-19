import type { Dispatch, SetStateAction } from "react";
import type { Group, MatchFiltersState } from "../types";

const rounds: Array<MatchFiltersState["round"]> = [
  "Alle Spiele",
  "Nur meine Teams",
  "Gruppenphase",
  "Sechzehntelfinale",
  "Achtelfinale",
  "Viertelfinale",
  "Halbfinale",
  "Spiel um Platz 3",
  "Finale",
];

const statuses = [
  { value: "", label: "Alle Status" },
  { value: "scheduled", label: "Geplant" },
  { value: "live", label: "Live" },
  { value: "finished", label: "Beendet" },
] as const;

interface Props {
  groups: Group[];
  filters: MatchFiltersState;
  setFilters: Dispatch<SetStateAction<MatchFiltersState>>;
}

export function MatchFilters({ groups, filters, setFilters }: Props) {
  return (
    <div className="mb-5 space-y-3 rounded-lg border border-white/10 bg-white/7 p-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {rounds.map((round) => (
          <button
            key={round}
            type="button"
            onClick={() => setFilters((current) => ({ ...current, round }))}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold ${
              filters.round === round ? "bg-gold text-night" : "bg-white/10 text-white hover:bg-white/15"
            }`}
          >
            {round}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Team suchen"
          className="rounded-md border border-white/10 bg-night px-3 py-3 text-white placeholder:text-white/40"
        />
        <select
          value={filters.group}
          onChange={(event) => setFilters((current) => ({ ...current, group: event.target.value as MatchFiltersState["group"] }))}
          className="rounded-md border border-white/10 bg-night px-3 py-3 text-white"
        >
          <option value="">Alle Gruppen</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.date}
          onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
          className="rounded-md border border-white/10 bg-night px-3 py-3 text-white"
        />
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as MatchFiltersState["status"] }))}
          className="rounded-md border border-white/10 bg-night px-3 py-3 text-white"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
