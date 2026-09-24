// Builds lib/delivery/cities.generated.ts from the Ameex tariff sheet
// (data/ameex-tarifs-meknes.csv, pickup hub: Meknès) and places every
// destination on the map with OpenStreetMap's Nominatim geocoder.
//
//   node scripts/build-delivery-cities.mjs
//
// Geocoding respects Nominatim's usage policy (1 request / second, identified
// User-Agent) and is cached in data/geocode-cache.json, so re-running after a
// tariff update only looks up new names. A position is kept only if it lies in
// Morocco and — when the name carries a region hint ("-taroudant",
// "(reg meknes)") — within 100 km of that region's town. Anything doubtful gets
// no pin rather than a wrong one.
import fs from "node:fs";

const CSV = "data/ameex-tarifs-meknes.csv";
const CACHE = "data/geocode-cache.json";
const OUT = "lib/delivery/cities.generated.ts";
const UA = "ElectroZakiStorefront/1.0 (+https://electrozaki-storefront.vercel.app)";
const DAYS = ["lun", "mar", "mer", "jeu", "ven", "sam", "dim"];

const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};
const saveCache = () => fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));

// ── Parse the sheet ──────────────────────────────────────────────────────
function parseCsvLine(line) {
  const out = [];
  let cur = "", quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

const rows = fs.readFileSync(CSV, "utf8").replace(/^﻿/, "").split(/\r?\n/).map(parseCsvLine);
const header = rows.findIndex((r) => r[0] === "Ville");
const seen = new Map();
const duplicates = [];
for (const r of rows.slice(header + 1)) {
  const name = (r[0] ?? "").trim();
  if (!name) continue;
  const fee = Number(r[1]);
  const days = r.slice(2, 9).map((c) => c.trim() === "✓");
  const key = name.toLowerCase();
  if (seen.has(key)) {
    // The sheet lists a few places twice; keep the row that actually delivers.
    const prev = seen.get(key);
    duplicates.push(name);
    if (days.filter(Boolean).length > prev.days.filter(Boolean).length) seen.set(key, { name, fee, days });
    continue;
  }
  seen.set(key, { name, fee, days });
}
const cities = [...seen.values()];

// ── Geocoding ────────────────────────────────────────────────────────────
const inMorocco = (lat, lng) => lat > 20.5 && lat < 36.1 && lng > -17.3 && lng < -0.9;
const km = (a, b) => {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(query) {
  if (query in cache) return cache[query];
  await sleep(1100);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ma&q=${encodeURIComponent(query)}`;
  let result = null;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "fr" } });
    if (res.ok) {
      const [hit] = await res.json();
      if (hit) result = { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name };
    } else {
      console.warn(`  HTTP ${res.status} for ${query}`);
      if (res.status === 429) { await sleep(30_000); return geocode(query); }
      return null; // not cached: retried next run
    }
  } catch (e) {
    console.warn(`  network error for ${query}: ${e.message}`);
    return null;
  }
  cache[query] = result;
  saveCache();
  return result;
}

const REGION_ALIASES = { hociema: "Al Hoceima", kacem: "Sidi Kacem", mohamedia: "Mohammedia", taounat: "Taounate", casa: "Casablanca" };
const tidy = (s) => s.replace(/\s+/g, " ").replace(/^[\s-]+|[\s-]+$/g, "").trim();

// Candidate searches, most specific first, plus the region hint to check against.
function candidates(raw) {
  let base = raw.replace(/[؀-ۿ]+/g, "").trim(); // drop the Arabic duplicate in "Sale Al Jadida-سلا"
  let hint = null;
  const paren = base.match(/^(.*?)\s*\((.*)\)\s*$/);
  if (paren) {
    base = tidy(paren[1]);
    hint = tidy(paren[2].replace(/^(reg(ion)?|région)\s*/i, ""));
  }
  const parts = base.split(/\s*-\s*|-/).map(tidy).filter((p) => p && !/^ville$/i.test(p));
  const q = [];
  if (parts.length > 1) {
    const [first, ...rest] = parts;
    const last = rest[rest.length - 1];
    hint ??= last;
    q.push(`${first}, ${rest.join(", ")}`, first, `${last}, ${first}`);
  } else {
    q.push(parts[0] ?? base);
  }
  if (hint) {
    const alias = REGION_ALIASES[hint.toLowerCase()];
    if (alias) hint = alias;
    q.unshift(`${parts[0]}, ${hint}`);
  }
  q.push(raw);
  return { queries: [...new Set(q.map((s) => `${s}, Maroc`))], hint };
}

const results = [];
let placed = 0;
for (const [i, city] of cities.entries()) {
  const { queries, hint } = candidates(city.name);
  const hintPos = hint ? await geocode(`${hint}, Maroc`) : null;
  let pos = null, via = null;
  for (const q of queries) {
    const hit = await geocode(q);
    if (!hit || !inMorocco(hit.lat, hit.lng)) continue;
    if (hintPos && km(hit, hintPos) > 100) continue;
    pos = hit; via = q;
    break;
  }
  if (pos) placed++;
  results.push({ ...city, lat: pos ? +pos.lat.toFixed(4) : null, lng: pos ? +pos.lng.toFixed(4) : null, via });
  if ((i + 1) % 25 === 0) console.log(`${i + 1}/${cities.length} (${placed} placés)`);
}

// ── Output ───────────────────────────────────────────────────────────────
const lines = results
  .sort((a, b) => a.name.localeCompare(b.name, "fr"))
  .map((c) => `  { name: ${JSON.stringify(c.name)}, fee: ${c.fee}, days: "${c.days.map((d) => (d ? 1 : 0)).join("")}", lat: ${c.lat}, lng: ${c.lng} },`);
fs.mkdirSync("lib/delivery", { recursive: true });
fs.writeFileSync(
  OUT,
  `// GENERATED by scripts/build-delivery-cities.mjs from ${CSV} — do not edit by hand.
// Ameex tariffs from the Meknès pickup hub. days = delivery days Mon→Sun
// ("1" = delivers that day). lat/lng = OpenStreetMap position (null when it
// couldn't be placed reliably — no pin is shown then).
export type RawCity = { name: string; fee: number; days: string; lat: number | null; lng: number | null };

export const CITIES: RawCity[] = [
${lines.join("\n")}
];
`
);
const missing = results.filter((c) => c.lat === null).map((c) => c.name);
console.log(`\n${results.length} destinations, ${placed} placées sur la carte, ${missing.length} sans position.`);
if (duplicates.length) console.log(`Doublons fusionnés : ${[...new Set(duplicates)].join(", ")}`);
if (missing.length) console.log(`Sans position : ${missing.join(", ")}`);
void DAYS;
