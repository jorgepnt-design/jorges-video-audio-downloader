import type { UserProfile, UserSettings } from "../types";

export const localUser: UserProfile = {
  id: "local-user",
  name: "Lokaler Fan",
  email: "",
  createdAt: new Date().toISOString(),
};

export const defaultSettings: UserSettings = {
  userId: localUser.id,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  reminder24h: true,
  reminder1h: true,
  reminder15min: false,
  calendarProvider: "google",
  theme: "dark",
};
