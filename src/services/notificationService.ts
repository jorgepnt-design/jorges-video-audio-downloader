import { defaultSettings } from "../data/mockUser";
import type { UserSettings } from "../types";
import { storageService } from "./storageService";

const KEY = "settings";

export const notificationService = {
  getSettings(): UserSettings {
    return storageService.get<UserSettings>(KEY, defaultSettings);
  },
  saveSettings(settings: UserSettings): void {
    storageService.set(KEY, settings);
  },
  async requestPermissionPlaceholder(): Promise<NotificationPermission | "unsupported"> {
    // TODO: Wire to Firebase Cloud Messaging or Web Push subscription flow.
    if (!("Notification" in window)) return "unsupported";
    return Notification.requestPermission();
  },
};
