export const DEFAULT_TIME_ZONE = "UTC";

function hasSupportedTimeZoneApi() {
  return typeof Intl !== "undefined" && typeof Intl.supportedValuesOf === "function";
}

export function getSupportedTimeZones() {
  if (hasSupportedTimeZoneApi()) {
    return Array.from(new Set([DEFAULT_TIME_ZONE, ...Intl.supportedValuesOf("timeZone")])).sort();
  }

  return [
    "UTC",
    "America/Anchorage",
    "America/Los_Angeles",
    "America/Phoenix",
    "America/Denver",
    "America/Chicago",
    "America/New_York",
    "America/Toronto",
    "America/Mexico_City",
    "America/Bogota",
    "America/Lima",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "Europe/Dublin",
    "Europe/London",
    "Europe/Lisbon",
    "Europe/Madrid",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Rome",
    "Europe/Amsterdam",
    "Europe/Stockholm",
    "Europe/Warsaw",
    "Europe/Athens",
    "Europe/Istanbul",
    "Africa/Cairo",
    "Africa/Johannesburg",
    "Asia/Dubai",
    "Asia/Jerusalem",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Shanghai",
    "Asia/Hong_Kong",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Perth",
    "Australia/Adelaide",
    "Australia/Sydney",
    "Pacific/Auckland",
    "Pacific/Honolulu",
  ];
}

export function isValidTimeZone(value?: string | null) {
  if (!value) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getBrowserTimeZone() {
  const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimeZone(browserTimeZone) ? browserTimeZone : DEFAULT_TIME_ZONE;
}

export function normalizeTimeZone(value?: string | null, fallback = DEFAULT_TIME_ZONE) {
  return isValidTimeZone(value) ? value! : fallback;
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formatter.formatToParts(date).reduce<Record<string, string>>((accumulator, part) => {
    if (part.type !== "literal") {
      accumulator[part.type] = part.value;
    }
    return accumulator;
  }, {});
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - date.getTime();
}

export function formatDateForTimeZone(
  value: string | Date | null | undefined,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    ...(options ? {} : { dateStyle: "medium" as const }),
    ...options,
  }).format(new Date(value));
}

export function formatDateTimeForTimeZone(
  value: string | Date | null | undefined,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    ...(options ? {} : { dateStyle: "medium" as const, timeStyle: "short" as const }),
    ...options,
  }).format(new Date(value));
}

export function formatTimeForTimeZone(
  value: string | Date | null | undefined,
  timeZone: string,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: normalizeTimeZone(timeZone),
    ...(options ? {} : { timeStyle: "short" as const }),
    ...options,
  }).format(new Date(value));
}

export function toDateTimeLocalValueInTimeZone(value: string | Date, timeZone: string) {
  const parts = getTimeZoneParts(new Date(value), normalizeTimeZone(timeZone));

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseDateTimeLocalInTimeZoneToUtcIso(value: string, timeZone: string) {
  const [datePart, timePart] = value.split("T");

  if (!datePart || !timePart) {
    throw new Error("Choose a valid meeting time.");
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) {
    throw new Error("Choose a valid meeting time.");
  }

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const initialOffset = getTimeZoneOffsetMs(new Date(utcGuess), normalizeTimeZone(timeZone));
  const correctedUtc = utcGuess - initialOffset;
  const correctedOffset = getTimeZoneOffsetMs(new Date(correctedUtc), normalizeTimeZone(timeZone));

  return new Date(utcGuess - correctedOffset).toISOString();
}
