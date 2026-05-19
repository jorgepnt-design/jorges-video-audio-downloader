import { RefreshCcw } from "lucide-react";
import { useLiveScores } from "../hooks/useLiveScores";

export function LiveUpdateButton() {
  const { lastUpdate, isUpdating, error, refreshLiveData } = useLiveScores();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={refreshLiveData}
        className="inline-flex items-center gap-2 rounded-md border border-gold/40 bg-gold/10 px-4 py-3 font-bold text-gold hover:bg-gold/15"
      >
        <RefreshCcw className={isUpdating ? "animate-spin" : ""} size={18} aria-hidden />
        Live-Daten aktualisieren
      </button>
      {lastUpdate && (
        <span className="text-sm text-white/55">
          Automatisch geprüft: {new Date(lastUpdate.updatedAt).toLocaleTimeString("de-DE")} · {lastUpdate.source === "api" ? "API" : "Mock"}
        </span>
      )}
      {error && <span className="text-sm text-red-100">{error}</span>}
    </div>
  );
}
