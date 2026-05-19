import type { UserSettings } from "../types";

interface Props {
  settings: UserSettings;
  onChange: (settings: UserSettings) => void;
}

export function NotificationSettings({ settings, onChange }: Props) {
  const update = (key: keyof UserSettings, value: UserSettings[keyof UserSettings]) => onChange({ ...settings, [key]: value });

  return (
    <section className="rounded-lg border border-white/10 bg-white/7 p-4">
      <h3 className="text-xl font-black">Benachrichtigungen</h3>
      <p className="mt-1 text-sm text-white/60">Lokale Vorbereitung für spätere Web Push oder Firebase Cloud Messaging.</p>
      <div className="mt-4 grid gap-3">
        {[
          ["reminder24h", "24 Stunden vorher"],
          ["reminder1h", "1 Stunde vorher"],
          ["reminder15min", "15 Minuten vorher"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center justify-between rounded-md bg-night/70 px-3 py-3">
            <span>{label}</span>
            <input type="checkbox" checked={Boolean(settings[key as keyof UserSettings])} onChange={(event) => update(key as keyof UserSettings, event.target.checked)} className="h-5 w-5 accent-gold" />
          </label>
        ))}
      </div>
    </section>
  );
}
