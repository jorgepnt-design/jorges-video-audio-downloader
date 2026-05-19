import { Timer } from "lucide-react";
import { useCountdown } from "../hooks/useCountdown";

export function CountdownCard({ dateUtc }: { dateUtc?: string }) {
  const countdown = useCountdown(dateUtc);

  if (!countdown) {
    return (
      <div className="rounded-lg border border-white/10 bg-night/55 p-4">
        <p className="text-sm font-semibold text-white/55">Countdown</p>
        <p className="mt-2 text-white/75">Wähle Favoriten für dein nächstes Spiel.</p>
      </div>
    );
  }

  const parts = [
    ["Tage", countdown.days],
    ["Std", countdown.hours],
    ["Min", countdown.minutes],
    ["Sek", countdown.seconds],
  ];

  return (
    <div className="rounded-lg border border-gold/30 bg-night/55 p-4 shadow-glow">
      <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gold">
        <Timer size={16} aria-hidden /> Countdown
      </p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {parts.map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-white/8 p-2 text-center">
            <p className="text-2xl font-black">{String(value).padStart(2, "0")}</p>
            <p className="text-[11px] uppercase text-white/50">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
