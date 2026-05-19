import { calendarService } from "../services/calendarService";
import type { Match, UserSettings } from "../types";

export const useCalendarExport = (matches: Match[], settings: UserSettings) => ({
  exportCalendar: () => calendarService.downloadIcs(matches, settings),
  icsContent: () => calendarService.createIcs(matches, settings),
});
