// The store's clock (same rule as the ERP's src/lib/time.ts).
//
// Morocco moved to GMT+0 for good in September 2026, but browsers and Node
// ship time-zone data (2026a) that still puts 'Africa/Casablanca' at GMT+1.
// A fixed offset can't go stale that way; if the legal time ever changes
// again, change STORE_UTC_OFFSET_HOURS only.
export const STORE_UTC_OFFSET_HOURS = 0;

/** IANA fixed-offset zone for Intl / toLocale* (Etc/GMT signs are inverted). */
export const STORE_TIME_ZONE =
  STORE_UTC_OFFSET_HOURS === 0
    ? "Etc/GMT"
    : `Etc/GMT${STORE_UTC_OFFSET_HOURS > 0 ? "-" : "+"}${Math.abs(STORE_UTC_OFFSET_HOURS)}`;

/** Calendar fields of an instant on the store's wall clock. */
export function storeParts(date: Date | number = Date.now()) {
  const d = new Date(new Date(date).getTime() + STORE_UTC_OFFSET_HOURS * 3_600_000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(), // 0 = Sunday
    hours: d.getUTCHours(),
    minutes: d.getUTCMinutes(),
  };
}
