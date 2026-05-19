import { PredictionList } from "../components/PredictionList";
import { SectionHeader } from "../components/SectionHeader";
import type { Match, Prediction, Team, UserSettings } from "../types";

interface Props {
  matches: Match[];
  favoriteTeams: Team[];
  predictions: Prediction[];
  settings: UserSettings;
  onSave: (matchId: string, scoreA: number, scoreB: number) => void;
}

export function PredictionsPage(props: Props) {
  return (
    <>
      <SectionHeader eyebrow="Tippspiel" title="Tipps lokal speichern" description="Die Basis für Freunde, private Gruppen, Einladungscodes, Punktewertung und Rangliste ist vorbereitet." />
      <PredictionList {...props} />
      <section className="mt-5 rounded-lg border border-white/10 bg-white/7 p-4">
        <h3 className="text-xl font-black">Rangliste</h3>
        <p className="mt-2 text-white/65">Platzhalter für spätere Tippspiel-Gruppen mit Login, Einladungscode und Live-Synchronisierung.</p>
      </section>
    </>
  );
}
