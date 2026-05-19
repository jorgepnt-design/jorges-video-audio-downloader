export const formatLocalDate = (dateUtc: string, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) =>
  new Intl.DateTimeFormat("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: timezone }).format(
    new Date(dateUtc),
  );

export const formatLocalTime = (dateUtc: string, timezone = Intl.DateTimeFormat().resolvedOptions().timeZone) =>
  new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: timezone, timeZoneName: "short" }).format(new Date(dateUtc));

export const formatUtcTime = (dateUtc: string) =>
  new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(new Date(dateUtc));
