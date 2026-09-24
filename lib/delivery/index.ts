import { CITIES } from "./cities.generated";
import { storeParts } from "@/lib/time";

// ─────────────────────────────────────────────────────────────────────────
// Delivery by Ameex from the Meknès hub (tariffs: data/ameex-tarifs-meknes.csv,
// regenerate with scripts/build-delivery-cities.mjs).
//
// How it works in real life (owner, 2026-09-24):
// - orders are taken until 12:00 — Ameex collects at the shop around 13:00,
//   every day of the week;
// - after collection a parcel takes 24–30 h to reach the destination's hub;
// - it then only goes out on a day that destination is served, so a place
//   served Tue/Thu/Sat can wait a day or two more at its hub;
// - a few places aren't served at all (0 days): the customer may still order,
//   but is told plainly and the order is flagged for staff.
// ─────────────────────────────────────────────────────────────────────────

export const ORDER_CUTOFF_HOUR = 12;

export type DeliveryCity = {
  name: string;
  fee: number;
  /** Mon → Sun */
  days: boolean[];
  lat: number | null;
  lng: number | null;
};

export const DELIVERY_CITIES: DeliveryCity[] = CITIES.map((c) => ({
  name: c.name,
  fee: c.fee,
  days: [...c.days].map((d) => d === "1"),
  lat: c.lat,
  lng: c.lng,
}));

const byName = new Map(DELIVERY_CITIES.map((c) => [c.name, c]));

/** Exact lookup (the name picked from the list) — the server never trusts a fee from the browser. */
export function findCity(name: string | null | undefined): DeliveryCity | undefined {
  return name ? byName.get(name) : undefined;
}

/** Accent/case-insensitive text for searching ("Fès" matches "fes"). */
export function searchKey(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export type DeliveryEstimate =
  | { deliverable: false }
  | {
      deliverable: true;
      /** 'YYYY-MM-DD' (store calendar) */
      shipDate: string;
      deliveryDate: string;
      /** ordered after 12:00 → ships the next day */
      afterCutoff: boolean;
      /** waits at the destination hub for its next delivery day */
      waitsForDeliveryDay: boolean;
    };

const DAY_MS = 86_400_000;

/** A store-calendar day as a UTC-midnight Date (safe for date arithmetic). */
function dayOf(ms: number): Date {
  const p = storeParts(ms);
  return new Date(Date.UTC(p.year, p.month - 1, p.day));
}
const iso = (d: Date) => d.toISOString().slice(0, 10);
const mondayFirst = (d: Date) => (d.getUTCDay() + 6) % 7;

export function estimateDelivery(city: DeliveryCity, now: number = Date.now()): DeliveryEstimate {
  if (!city.days.some(Boolean)) return { deliverable: false };

  const afterCutoff = storeParts(now).hours >= ORDER_CUTOFF_HOUR;
  const ship = dayOf(now);
  if (afterCutoff) ship.setUTCDate(ship.getUTCDate() + 1);

  // 24–30 h in transit → at the destination hub the next day.
  const atHub = new Date(ship.getTime() + DAY_MS);
  const delivery = new Date(atHub);
  for (let i = 0; i < 7 && !city.days[mondayFirst(delivery)]; i++) {
    delivery.setUTCDate(delivery.getUTCDate() + 1);
  }

  return {
    deliverable: true,
    shipDate: iso(ship),
    deliveryDate: iso(delivery),
    afterCutoff,
    waitsForDeliveryDay: delivery.getTime() !== atHub.getTime(),
  };
}

/** "jeudi 25 septembre" for a 'YYYY-MM-DD' store date. */
export function frenchDay(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "aujourd'hui" / "demain" / "jeudi 25 septembre", relative to now on the store clock. */
export function relativeDay(isoDate: string, now: number = Date.now()): string {
  const today = iso(dayOf(now));
  const tomorrow = iso(new Date(dayOf(now).getTime() + DAY_MS));
  if (isoDate === today) return "aujourd'hui";
  if (isoDate === tomorrow) return "demain";
  return frenchDay(isoDate);
}
