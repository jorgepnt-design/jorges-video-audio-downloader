import type { ReactNode } from "react";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "green" | "red" | "blue" }) {
  const tones = {
    neutral: "bg-white/10 text-white/70",
    gold: "bg-gold/15 text-gold",
    green: "bg-pitch/20 text-green-100",
    red: "bg-ember/20 text-red-100",
    blue: "bg-sky-500/20 text-sky-100",
  };
  return <span className={`rounded-md px-2 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}
