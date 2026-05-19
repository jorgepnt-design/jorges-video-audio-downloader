export function LoadingState({ label = "Lädt..." }: { label?: string }) {
  return <div className="rounded-lg border border-white/10 bg-white/7 p-6 text-white/65">{label}</div>;
}
