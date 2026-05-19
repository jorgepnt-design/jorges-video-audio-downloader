import { useState } from "react";
import { notificationService } from "../services/notificationService";
import type { UserSettings } from "../types";

export const useUserSettings = () => {
  const [settings, setSettingsState] = useState<UserSettings>(() => notificationService.getSettings());

  const setSettings = (next: UserSettings) => {
    notificationService.saveSettings(next);
    setSettingsState(next);
  };

  return { settings, setSettings };
};
