import { cache } from "react";
import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

// Every option a phone model has had in the shop, available or not, so the
// pickers can show the ones out of stock crossed out instead of hiding them:
// the model's colours (the ERP's colour photos, plus any colour in stock)
// and its listings, one per grade + storage (a sold-out listing is kept,
// hidden, by the ERP's sync).

export type ModelListing = {
  slug: string;
  grade: string;
  storage: string | null;
  ram: string | null;
  available: boolean;
};

export type ModelOptions = { colors: string[]; listings: ModelListing[] };

const storageSize = (s: string | null) => (s ? parseInt(s) * (/TB|To/i.test(s) ? 1024 : 1) : 0);

type PhotoRow = { modelKey: string; color: string };
type ListingRow = {
  modelKey: string | null;
  slug: string;
  condition: string;
  specs: unknown;
  availability: AvailabilityStatus;
  variants: { color: string | null }[];
};

const LISTING_SELECT = {
  modelKey: true,
  slug: true,
  condition: true,
  specs: true,
  availability: true,
  variants: { where: { stockQuantity: { gt: 0 } }, select: { color: true } },
} as const;

function buildOptions(photos: PhotoRow[], rows: ListingRow[]): ModelOptions {
  const spec = (s: unknown, k: string) => {
    const v = (s as Record<string, unknown> | null)?.[k];
    return typeof v === "string" && v.trim() ? v.replace(/\s+/g, "") : null;
  };
  const colors = new Set(photos.map((p) => p.color));
  for (const r of rows) if (r.availability === AvailabilityStatus.IN_STOCK) for (const v of r.variants) if (v.color) colors.add(v.color);
  return {
    colors: [...colors].sort((a, b) => a.localeCompare(b, "fr")),
    listings: rows
      .map((r) => ({
        slug: r.slug,
        grade: r.condition,
        storage: spec(r.specs, "Stockage"),
        ram: spec(r.specs, "RAM"),
        available: r.availability === AvailabilityStatus.IN_STOCK && r.variants.length > 0,
      }))
      .sort((a, b) => storageSize(a.storage) - storageSize(b.storage)),
  };
}

export const getModelOptions = cache(async (modelKey: string): Promise<ModelOptions> => {
  const [photos, rows] = await Promise.all([
    prisma.modelPhoto.findMany({ where: { modelKey }, select: { modelKey: true, color: true } }),
    prisma.product.findMany({ where: { modelKey, isPhone: true, published: true }, select: LISTING_SELECT }),
  ]);
  return buildOptions(photos, rows);
});

/**
 * The options of many models at once, in two queries: a page listing every
 * model (the phones aisle, /prix) used to ask model by model, 37 round trips
 * to the database one after the other (about 5 seconds).
 */
export async function getManyModelOptions(modelKeys: string[]): Promise<Map<string, ModelOptions>> {
  const keys = [...new Set(modelKeys)];
  if (!keys.length) return new Map();
  const [photos, rows] = await Promise.all([
    prisma.modelPhoto.findMany({ where: { modelKey: { in: keys } }, select: { modelKey: true, color: true } }),
    prisma.product.findMany({ where: { modelKey: { in: keys }, isPhone: true, published: true }, select: LISTING_SELECT }),
  ]);
  return new Map(keys.map((k) => [k, buildOptions(photos.filter((p) => p.modelKey === k), rows.filter((r) => r.modelKey === k))]));
}

/**
 * Which colour each model photo shows (the ERP's photo per model + colour),
 * by photo address: lets every photo be described as "iPhone 13 - Rouge".
 */
export async function getPhotoColors(modelKeys: string[]): Promise<Map<string, string>> {
  const keys = [...new Set(modelKeys.filter(Boolean))];
  if (!keys.length) return new Map();
  const rows = await prisma.modelPhoto.findMany({ where: { modelKey: { in: keys } }, select: { url: true, color: true } });
  return new Map(rows.map((r) => [r.url, r.color]));
}

/**
 * Every model photo's colour (ERP "Catalogue du site → Photo téléphone"),
 * read once per page render: lists of product cards describe each cover
 * without a query per card.
 */
export const getAllPhotoColors = cache(async (): Promise<Map<string, string>> => {
  const rows = await prisma.modelPhoto.findMany({ select: { url: true, color: true } });
  return new Map(rows.map((r) => [r.url, r.color]));
});

/**
 * A model the shop has listed at least once (sold out or not), by its page
 * address (/telephones/redmi-12-5g): its name for a search ("Redmi 12 5G"),
 * or null for an address that never existed.
 */
export async function listedModelName(slug: string): Promise<string | null> {
  const { offerSlug } = await import("@/lib/offers/phone-offers");
  const rows = await prisma.product.findMany({
    where: { isPhone: true, modelKey: { not: null } },
    select: { modelKey: true, name: true, brand: true },
    distinct: ["modelKey"],
  });
  const hit = rows.find((r) => offerSlug(r.modelKey!) === slug);
  if (!hit) return null;
  // "Xiaomi Redmi 12 5G 256GB" → "Redmi 12 5G" (storage and brand dropped).
  const noStorage = hit.name.replace(/\s*\b\d+\s?(?:GB|TB|Go|To)\b.*$/i, "").trim();
  return hit.brand && noStorage.toLowerCase().startsWith(`${hit.brand.toLowerCase()} `) ? noStorage.slice(hit.brand.length + 1) : noStorage;
}
