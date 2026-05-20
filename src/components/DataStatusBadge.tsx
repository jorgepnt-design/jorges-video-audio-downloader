import { CheckCircle2, Clock3, Database } from "lucide-react";
import type { OfficialDataStatus } from "../types";

interface Props {
  status?: OfficialDataStatus;
  compact?: boolean;
}

const copy: Record<OfficialDataStatus, { label: string; detail: string; className: string; icon: typeof Database }> = {
  mock: {
    label: "Vorläufige Daten",
    detail: "Offizielle Daten noch nicht verfügbar. Automatisch aktualisiert, sobald verfügbar.",
    className: "border-gold/30 bg-gold/10 text-gold",
    icon: Database,
  },
  provisional: {
    label: "Vorläufig bestätigt",
    detail: "Daten können sich bis zur offiziellen Bestätigung noch ändern.",
    className: "border-sky/30 bg-sky/10 text-blue-100",
    icon: Clock3,
  },
  official: {
    label: "Offiziell",
    detail: "Offizielle Daten wurden übernommen.",
    className: "border-pitch/30 bg-pitch/15 text-green-100",
    icon: CheckCircle2,
  },
};

export function DataStatusBadge({ status = "mock", compact = false }: Props) {
  const item = copy[status];
  const Icon = item.icon;

  return (
    <div className={`rounded-md border px-3 py-2 ${item.className}`}>
      <p className="flex items-center gap-2 text-sm font-bold">
        <Icon size={16} aria-hidden />
        {item.label}
      </p>
      {!compact && <p className="mt-1 text-xs leading-relaxed opacity-80">{item.detail}</p>}
    </div>
  );
}
