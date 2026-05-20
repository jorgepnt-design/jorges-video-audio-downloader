import type { Match, UserSettings } from "../types";
import { matchService } from "./matchService";

const pad = (value: number) => String(value).padStart(2, "0");
const formatIcsDate = (dateUtc: string) => {
  const date = new Date(dateUtc);
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
};
const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");

export const calendarService = {
  createIcs(matches: Match[], settings: UserSettings): string {
    const events = matches.map((match) => {
      const start = formatIcsDate(match.dateUtc);
      const end = formatIcsDate(new Date(new Date(match.dateUtc).getTime() + 2 * 60 * 60 * 1000).toISOString());
      const alarms = [
        settings.reminder24h ? "BEGIN:VALARM\nTRIGGER:-PT24H\nACTION:DISPLAY\nDESCRIPTION:Spiel morgen\nEND:VALARM" : "",
        settings.reminder1h ? "BEGIN:VALARM\nTRIGGER:-PT1H\nACTION:DISPLAY\nDESCRIPTION:Spiel in einer Stunde\nEND:VALARM" : "",
        settings.reminder15min ? "BEGIN:VALARM\nTRIGGER:-PT15M\nACTION:DISPLAY\nDESCRIPTION:Spiel in 15 Minuten\nEND:VALARM" : "",
      ].filter(Boolean);
      return [
        "BEGIN:VEVENT",
        `UID:${match.id}@wm-2026-companion.local`,
        `DTSTAMP:${formatIcsDate(new Date().toISOString())}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${escapeText(`${matchService.getTeamDisplayLabel(match.teamAId)} vs ${matchService.getTeamDisplayLabel(match.teamBId)}`)}`,
        `LOCATION:${escapeText(`${match.stadium}, ${match.city}`)}`,
        `DESCRIPTION:${escapeText(`${match.round}${match.groupName ? ` - ${match.groupName}` : ""}`)}`,
        ...alarms,
        "END:VEVENT",
      ].join("\n");
    });

    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Jorge´s WM-Planer 2026//DE", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\n");
  },
  downloadIcs(matches: Match[], settings: UserSettings): void {
    const blob = new Blob([this.createIcs(matches, settings)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "wm-2026-meine-spiele.ics";
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
