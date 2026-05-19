import { BarChart3, Bell, CalendarDays, Home, ListChecks, Settings, Shield } from "lucide-react";

export type PageId = "dashboard" | "teams" | "schedule" | "groups" | "predictions" | "settings";

const items = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "teams", label: "Teams", icon: Shield },
  { id: "schedule", label: "Spielplan", icon: CalendarDays },
  { id: "groups", label: "Gruppen", icon: BarChart3 },
  { id: "predictions", label: "Tipps", icon: ListChecks },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

interface Props {
  current: PageId;
  onNavigate: (page: PageId) => void;
}

export function Navigation({ current, onNavigate }: Props) {
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-night/95 backdrop-blur md:hidden safe-bottom">
        <div className="grid grid-cols-6 gap-1 px-2 pt-2">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-md text-[11px] ${
                current === id ? "bg-gold text-night" : "text-white/70"
              }`}
              title={label}
            >
              <Icon size={19} aria-hidden />
              <span className="mt-1 truncate">{label}</span>
            </button>
          ))}
        </div>
      </nav>
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 rounded-lg border border-white/10 bg-white/7 p-4 backdrop-blur md:block">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-wide text-gold">WM 2026</p>
          <h1 className="text-2xl font-black">Companion</h1>
        </div>
        <div className="space-y-2">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left ${
                current === id ? "bg-gold text-night" : "text-white/75 hover:bg-white/10"
              }`}
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-white/75">
          <Bell className="mb-2 text-gold" size={20} aria-hidden />
          <p className="font-bold text-white">Offline nutzbar</p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">Favoriten und Tipps werden lokal gespeichert.</p>
        </div>
      </aside>
    </>
  );
}
