import { Smartphone } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";

export function PWAInstallPrompt() {
  const { canInstall, install } = usePWAInstall();

  if (!canInstall) return null;

  return (
    <button type="button" onClick={install} className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 font-bold text-night">
      <Smartphone size={18} aria-hidden />
      App installieren
    </button>
  );
}
