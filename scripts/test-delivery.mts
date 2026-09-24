// Delivery-date rules (lib/delivery) on fixed dates — no database needed.
//   npx tsx scripts/test-delivery.mts
import { estimateDelivery, findCity, DELIVERY_CITIES } from "@/lib/delivery";

const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: unknown) =>
  results.push({ name, ok, detail: detail === undefined ? undefined : JSON.stringify(detail) });

// Store clock is GMT+0: '…Z' times are Moroccan wall-clock times.
const at = (iso: string) => Date.parse(iso);
function est(city: string, when: string) {
  const c = findCity(city);
  if (!c) throw new Error(`unknown city ${city}`);
  return estimateDelivery(c, at(when));
}

// 2026-09-23 is a Wednesday.
let e = est("Fes", "2026-09-23T10:00:00Z");
check("Fès (7/7), Wed 10:00 → ships Wed, delivered Thu",
  e.deliverable && e.shipDate === "2026-09-23" && e.deliveryDate === "2026-09-24" && !e.afterCutoff, e);

e = est("Fes", "2026-09-23T11:59:00Z");
check("11:59 is still before the cutoff", e.deliverable && e.shipDate === "2026-09-23", e);

e = est("Fes", "2026-09-23T12:00:00Z");
check("12:00 → ships Thu, delivered Fri", e.deliverable && e.afterCutoff && e.shipDate === "2026-09-24" && e.deliveryDate === "2026-09-25", e);

e = est("Fes", "2026-09-23T23:30:00Z");
check("late evening still ships the next day", e.deliverable && e.shipDate === "2026-09-24", e);

e = est("Meknes", "2026-09-26T10:00:00Z"); // Saturday; Meknès not served on Sunday
check("Meknès, Sat 10:00 → at hub Sun, delivered Mon (no Sunday delivery)",
  e.deliverable && e.shipDate === "2026-09-26" && e.deliveryDate === "2026-09-28" && e.waitsForDeliveryDay, e);

e = est("El Hajeb", "2026-09-23T10:00:00Z"); // served Tue/Thu/Sat
check("El Hajeb (Tue/Thu/Sat), Wed → Thu", e.deliverable && e.deliveryDate === "2026-09-24" && !e.waitsForDeliveryDay, e);

e = est("El Hajeb", "2026-09-24T10:00:00Z");
check("El Hajeb, Thu → at hub Fri, waits → Sat", e.deliverable && e.deliveryDate === "2026-09-26" && e.waitsForDeliveryDay, e);

e = est("Oualidia", "2026-09-28T10:00:00Z"); // Monday only
check("Oualidia (Mon only), Mon → next Mon", e.deliverable && e.deliveryDate === "2026-10-05", e);

e = est("Ain Bida", "2026-09-23T10:00:00Z");
check("Ain Bida (never served) → not deliverable", !e.deliverable, e);

e = est("Marrakech", "2026-09-26T15:00:00Z"); // Sat after cutoff, 7/7 city
check("Marrakech (7/7), Sat 15:00 → ships Sun (7/7 pickup), delivered Mon", e.deliverable && e.shipDate === "2026-09-27" && e.deliveryDate === "2026-09-28", e);

check("every destination has a fee between 20 and 45 DH", DELIVERY_CITIES.every((c) => c.fee >= 20 && c.fee <= 45));
check("names are unique", new Set(DELIVERY_CITIES.map((c) => c.name.toLowerCase())).size === DELIVERY_CITIES.length);
check("Meknès costs 20 DH", findCity("Meknes")?.fee === 20);
check("unknown name is rejected", findCity("Atlantis") === undefined);
const placed = DELIVERY_CITIES.filter((c) => c.lat !== null).length;
check(`most destinations are on the map (${placed}/${DELIVERY_CITIES.length})`, placed / DELIVERY_CITIES.length > 0.85);

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  → ${r.detail}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
