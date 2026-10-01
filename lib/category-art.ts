// Which drawing stands for which aisle (components/storefront/DeviceArt).
// Most products come from the ERP without a photo, so every card, tile and
// placeholder shows what the thing *is* — a cable looks like a cable —
// instead of a grey "image à venir" box.

export type ArtKind =
  | "phone"
  | "case"
  | "glass"
  | "charger"
  | "cable"
  | "earbuds"
  | "airpods"
  | "headphones"
  | "powerbank"
  | "watch"
  | "sim"
  | "mount"
  | "pad"
  | "bolt";

const BY_CATEGORY: Record<string, ArtKind> = {
  telephones: "phone",
  pochettes: "case",
  incassables: "glass",
  chargeurs: "charger",
  "tete-de-chargeur": "charger",
  cables: "cable",
  ecouteurs: "earbuds",
  airpods: "airpods",
  casque: "headphones",
  powerbank: "powerbank",
  band: "watch",
  "carte-sim": "sim",
  "support-magnetique": "mount",
  "sticky-pad": "pad",
};

// Brand aisles (e.g. "Oraimo") mix product types: guess from the name.
const BY_NAME: [RegExp, ArtKind][] = [
  [/c[aâ]ble|\bu-c\b|\bu-l\b|\bc-c\b|\bc-l\b|\bu-m\b|line/i, "cable"],
  [/chargeur|charger|adaptateur|\d+\s?w\b/i, "charger"],
  [/power\s?bank|\d+k\b/i, "powerbank"],
  [/airpods/i, "airpods"],
  [/buds|airy|[ée]couteur|earpods|freepods|jack/i, "earbuds"],
  [/casque|headphone/i, "headphones"],
  [/watch|montre|band/i, "watch"],
  [/coque|pochette|case/i, "case"],
  [/verre|glass|incassable/i, "glass"],
];

export function artFor(categorySlug: string | null | undefined, productName?: string): ArtKind {
  const byCat = categorySlug ? BY_CATEGORY[categorySlug] : undefined;
  if (byCat) return byCat;
  if (productName) {
    for (const [re, kind] of BY_NAME) if (re.test(productName)) return kind;
  }
  return "bolt";
}

// (Each aisle's one-line description is text: see t.aisleBlurb in the dictionaries.)
