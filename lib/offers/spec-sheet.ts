import type { Locale } from "@/lib/i18n/config";
import { OFFER_COPY } from "./copy";
import { MODEL_FACTS, type ModelFacts } from "./models";
import { offerSlug } from "./phone-offers";
import type { SpecRow } from "./spec-row";

// A phone model's spec sheet as translated rows: the "Fiche de l'appareil"
// on product pages and promo pages.

export { STORAGE_SLOT, type SpecRow } from "./spec-row";

// The sheets are written with French technical words; the English site
// gets them in English (Arabic and Darija readers know the French terms).
const EN_TERMS: [RegExp, string][] = [
  [/ultra grand-angle/g, "ultra-wide"],
  [/selon la version/g, "depending on version"],
  [/acier inoxydable/g, "stainless steel"],
  [/cadre titane/g, "titanium frame"],
  [/\btitane\b/g, "titanium"],
  [/\bTitane\b/g, "Titanium"],
  [/sans fil/g, "wireless"],
  [/recharge inversée/g, "reverse charging"],
  [/résiste aux chutes de/g, "drop-resistant to"],
  [/mode Action/g, "Action mode"],
  [/Cinématique/g, "Cinematic"],
  [/bouton Action/g, "Action button"],
  [/S Pen intégré/g, "built-in S Pen"],
  [/cœurs/g, "cores"],
];

export function localizeSpec(value: string, locale: Locale): string {
  return locale === "en" ? EN_TERMS.reduce((v, [re, to]) => v.replace(re, to), value) : value;
}

/** The fact sheet of a model, from the ERP's model key ("apple|iphone 14"). */
export function factsFor(modelKey: string | null | undefined): ModelFacts | null {
  return modelKey ? (MODEL_FACTS[offerSlug(modelKey)] ?? null) : null;
}

/**
 * The rows, in reading order. `storage` and `ram` come from the listing(s)
 * (the ERP), the rest from the model's sheet.
 */
export function specRows(f: ModelFacts, locale: Locale, own: { storage?: string | null; ram?: string | null } = {}): SpecRow[] {
  const c = OFFER_COPY[locale].specs;
  const L = c.labels;
  const ram = own.ram || f.ram;
  const battery = [f.specs.battery, f.videoHours ? c.video(f.videoHours) : null].filter(Boolean).join(" · ");
  const rows: [string, string | null | undefined][] = [
    [L.chip, f.specs.chip],
    [L.ram, ram],
    [L.storage, own.storage],
    [L.display, f.specs.display],
    [L.rearCameras, f.specs.rearCameras],
    [L.frontCamera, f.specs.frontCamera],
    [L.unlock, f.unlock ? c.unlocks[f.unlock] : null],
    [L.battery, battery],
    [L.charging, f.specs.charging],
    [L.sound, f.stereo ? c.stereo : null],
    [L.durability, f.specs.durability],
    [L.network, f.specs.network],
    [L.sim, f.specs.sim],
    [L.size, f.specs.size],
  ];
  return rows.filter((r): r is [string, string] => !!r[1]).map(([label, value]) => ({ label, value: localizeSpec(value, locale) }));
}
