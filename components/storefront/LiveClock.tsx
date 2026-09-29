"use client";

import { useSyncExternalStore } from "react";

// Meknès time, like a phone's status bar. Empty on the server and until
// hydration (the server's clock and timezone aren't the visitor's), then
// ticks every 15 s.
const TZ = "Africa/Casablanca";
const TIME = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const DAY = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

/** Current Meknès time (or date) as text; "" during server render. */
export function useMeknesClock(kind: "time" | "day" = "time"): string {
  const fmt = kind === "time" ? TIME : DAY;
  return useSyncExternalStore(
    subscribe,
    () => fmt.format(Date.now()),
    () => ""
  );
}

export function LiveClock({ className = "" }: { className?: string }) {
  const time = useMeknesClock("time");
  return <time className={`readout inline-block min-w-[2.6rem] ${className}`}>{time}</time>;
}
