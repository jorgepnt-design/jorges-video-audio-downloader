import { calendarService } from "../services/calendarService";
import type { Match, UserSettings } from "../types";

export const useCalendarExport = (matches: Match[], settings: UserSettings, filename?: string) => ({
  exportCalendar: () => calendarService.downloadIcs(matches, settings, filename),
  icsContent: () => calendarService.createIcs(matches, settings),
});
