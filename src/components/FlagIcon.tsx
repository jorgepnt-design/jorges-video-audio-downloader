import type { Team } from "../types";
import { getFlagUrl } from "../utils/flags";

interface Props {
  team: Team;
  className?: string;
}

export function FlagIcon({ team, className = "h-5 w-7" }: Props) {
  const flagUrl = getFlagUrl(team.id);

  if (!flagUrl) {
    return <span className="inline-flex h-5 min-w-7 items-center justify-center rounded-sm bg-white/10 px-1 text-[10px] font-black">{team.fifaCode.slice(0, 2)}</span>;
  }

  return (
    <img
      src={flagUrl}
      alt=""
      loading="lazy"
      className={`${className} inline-block rounded-[2px] object-cover shadow-sm shadow-black/30`}
      aria-hidden="true"
    />
  );
}
