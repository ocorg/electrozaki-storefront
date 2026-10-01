"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useLocale } from "@/components/i18n/I18nProvider";
import { LOCALE_META } from "@/lib/i18n/config";
import { STORE_TIME_ZONE } from "@/lib/time";

// Meknès time, like a phone's status bar. Empty on the server and until
// hydration (the server's clock and timezone aren't the visitor's), then
// ticks every 15 s. Day and month names follow the site's language; digits
// stay Western (0-9), as everywhere else on the site.
// Store time (lib/time.ts), not "Africa/Casablanca": browsers still put that
// zone at GMT+1, an hour ahead of Morocco since September 2026.
const TZ = STORE_TIME_ZONE;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/** Current Meknès time (or date) as text; "" during server render. */
export function useMeknesClock(kind: "time" | "day" = "time"): string {
  const locale = useLocale();
  const fmt = useMemo(() => {
    const intl = `${LOCALE_META[locale].intl}-u-nu-latn`;
    return kind === "time"
      ? new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ })
      : new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
  }, [locale, kind]);
  return useSyncExternalStore(
    subscribe,
    () => fmt.format(Date.now()),
    () => ""
  );
}

export function LiveClock({ className = "" }: { className?: string }) {
  const time = useMeknesClock("time");
  return (
    <time dir="ltr" className={`readout inline-block min-w-[2.6rem] ${className}`}>
      {time}
    </time>
  );
}
