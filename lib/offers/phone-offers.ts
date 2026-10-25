import { cache } from "react";
import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/client";
import { landingStatus } from "@/lib/db/landing";
import { MAX_QTY } from "@/lib/db/cart-pricing";
import { ACCESSORIES_OPEN } from "@/lib/site";
import { MODEL_FACTS, type ModelFacts } from "./models";
import { getManyModelOptions, getPhotoColors } from "@/lib/db/model-options";

// ─────────────────────────────────────────────────────────────────────────
// Phone offer pages (/offres/<model>): one page per phone model that has
// units on promo in the ERP, e.g. /offres/iphone-14 or /offres/galaxy-s24-ultra.
// A page exists while the model has promo units in stock and disappears with
// the last one: nothing to create or remove by hand. It sells those units
// at their ERP price (the promo is set in the ERP), every grade and storage
// of the model, ordered on the page.
//
// An ERP promo page ("Site web → Pages promo") with the same slug is an
// optional switch: switched off (or outside its dates) it takes the offer
// down; its views and orders are counted there.
// ─────────────────────────────────────────────────────────────────────────

/** "apple|iphone 13 pro" → "iphone-13-pro", "samsung|samsung galaxy s24 ultra" → "galaxy-s24-ultra". */
export function offerSlug(modelKey: string): string {
  const [brand = "", model = modelKey] = modelKey.split("|");
  const name = model.startsWith(`${brand} `) ? model.slice(brand.length + 1) : model;
  return name
    .toLowerCase()
    .replace(/\+/g, " plus")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export type PhoneOfferUnit = {
  id: string;
  productId: string;
  /** the model's offer page (/offres/<offerSlug>), and its name ("iPhone 14") */
  offerSlug: string;
  model: string;
  /** the listing's name, e.g. "iPhone 14 128GB" (cart, order, summary) */
  productName: string;
  name: string;
  /** grade code: TRES_BON, BON, PIECES_REMPLACEES… */
  grade: string;
  storage: string | null;
  color: string | null;
  batteryHealthPercent: number | null;
  /** promo price, whole DH */
  price: number;
  /** price before the promo */
  normalPrice: number;
  imageUrl: string | null;
  batteryGenuine: boolean | null;
  screenGenuine: boolean | null;
  faceIdWorking: boolean | null;
  cameraGenuine: boolean | null;
  chargingPortGenuine: boolean | null;
  speakerGenuine: boolean | null;
  hasDefects: boolean;
  /** capped at MAX_QTY: the page only needs "in stock" (stock depth is private) */
  stockQuantity: number;
};

export type OfferAddon = { key: string; productId: string; name: string; categorySlug: string; price: number; image: string | null };

export type PhoneOffer = {
  slug: string;
  modelKey: string;
  /** "apple", "samsung"… (the modelKey's brand) */
  brandKey: string;
  /** "iPhone 14 Pro" */
  name: string;
  brand: string;
  facts: ModelFacts | null;
  /** ERP promo page with this slug, when there is one (views and orders) */
  pageId: string | null;
  endsAt: Date | null;
  units: PhoneOfferUnit[];
  /** listings the units belong to (product page banners) */
  listingSlugs: string[];
  /** the photo's colour when known (alt text "iPhone 13 - Rouge") */
  images: { url: string; altText: string | null; color?: string | null }[];
  addons: OfferAddon[];
  fromPrice: number;
  /** normal price of the cheapest unit */
  normalFrom: number;
  /** biggest saving on one unit, DH */
  bestSaving: number;
  storages: string[];
  /** every grade, storage and colour the model has had (sold-out ones are shown crossed out) */
  options: { grades: string[]; storages: string[]; colors: string[] };
  /** memory of the units' listings ("8GB"), when the ERP gives it */
  rams: string[];
  grades: string[];
};

const GRADE_ORDER = ["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"];

// Before a model's compatible accessories are filled in the ERP, iPhones
// with a Lightning port suggest these (by product slug).
const DEFAULT_LIGHTNING_ADDONS = ["apple-c-l-25w", "apple-cable-c-l-1m", "apple-iphone-20w-originale"];

const UNIT_SELECT = {
  id: true,
  name: true,
  color: true,
  storageLabel: true,
  batteryHealthPercent: true,
  priceOverride: true,
  compareAtPrice: true,
  imageUrl: true,
  stockQuantity: true,
  batteryGenuine: true,
  screenGenuine: true,
  faceIdWorking: true,
  cameraGenuine: true,
  chargingPortGenuine: true,
  speakerGenuine: true,
  hasDefects: true,
} as const;

/** A promo unit that can be sold: in stock, on promo in the ERP, on a published listing in stock. */
const PROMO_UNIT = { stockQuantity: { gt: 0 }, compareAtPrice: { not: null } } as const;
/** Any unit that can be sold (a model's own page, /telephones/<model>). */
const IN_STOCK_UNIT = { stockQuantity: { gt: 0 } } as const;
const LISTING = { isPhone: true, published: true, availability: AvailabilityStatus.IN_STOCK, modelKey: { not: null } } as const;

function storageOf(p: { name: string; specs: unknown }, v: { storageLabel: string | null }): string | null {
  const spec = (p.specs as Record<string, unknown> | null)?.["Stockage"];
  if (v.storageLabel) return v.storageLabel;
  if (typeof spec === "string" && spec.trim()) return spec.trim();
  return p.name.match(/\b\d+\s?(?:GB|TB|Go|To)\b/i)?.[0].replace(/\s/g, "") ?? null;
}

/** "Samsung Galaxy S24 Ultra 256GB" → "Galaxy S24 Ultra" (when there is no fact sheet). */
function modelName(listingName: string, brand: string | null): string {
  const noStorage = listingName.replace(/\s*\b\d+\s?(?:GB|TB|Go|To)\b.*$/i, "").trim();
  return brand && noStorage.toLowerCase().startsWith(`${brand.toLowerCase()} `) ? noStorage.slice(brand.length + 1) : noStorage;
}

// "promo": the units on promo, for /offres/<model> (an ERP promo page with
// the same slug can switch it off). "model": every unit in stock, for the
// model's permanent page /telephones/<model>.
async function loadOffers(kind: "promo" | "model"): Promise<PhoneOffer[]> {
  const unitFilter = kind === "promo" ? PROMO_UNIT : IN_STOCK_UNIT;
  const listings = await prisma.product.findMany({
    where: { ...LISTING, variants: { some: unitFilter } },
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      modelKey: true,
      condition: true,
      specs: true,
      recommendedSalePrice: true,
      batteryGenuine: true,
      screenGenuine: true,
      faceIdWorking: true,
      cameraGenuine: true,
      chargingPortGenuine: true,
      speakerGenuine: true,
      images: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" } },
      variants: { where: unitFilter, select: UNIT_SELECT },
    },
  });

  const byModel = new Map<string, typeof listings>();
  for (const l of listings) {
    const key = l.modelKey!;
    byModel.set(key, [...(byModel.get(key) ?? []), l]);
  }

  const slugs = [...byModel.keys()].map(offerSlug);
  const pages =
    kind === "promo"
      ? await prisma.landingPage.findMany({
          where: { slug: { in: slugs } },
          select: { id: true, slug: true, active: true, startsAt: true, endsAt: true },
        })
      : [];
  const pageBySlug = new Map(pages.map((p) => [p.slug, p]));

  // Every model's options in one go (not one model after the other).
  const [optionsByModel, photoColor] = await Promise.all([getManyModelOptions([...byModel.keys()]), getPhotoColors([...byModel.keys()])]);

  const offers: PhoneOffer[] = [];
  for (const [modelKey, group] of byModel) {
    const slug = offerSlug(modelKey);
    const page = pageBySlug.get(slug);
    if (page && landingStatus(page) !== "live") continue; // switched off in the ERP
    const facts = MODEL_FACTS[slug] ?? null;
    const name = facts?.name ?? modelName(group[0].name, group[0].brand);

    const units: PhoneOfferUnit[] = group.flatMap((p) =>
      p.variants.map((v) => {
        const price = Number((v.priceOverride ?? p.recommendedSalePrice).toString());
        const was = v.compareAtPrice === null ? price : Number(v.compareAtPrice.toString());
        return {
          id: v.id,
          productId: p.id,
          offerSlug: slug,
          model: name,
          productName: p.name,
          name: v.name,
          grade: p.condition,
          storage: storageOf(p, v),
          color: v.color,
          batteryHealthPercent: v.batteryHealthPercent,
          price,
          normalPrice: Math.max(price, was),
          imageUrl: v.imageUrl,
          batteryGenuine: v.batteryGenuine ?? p.batteryGenuine,
          screenGenuine: v.screenGenuine ?? p.screenGenuine,
          faceIdWorking: v.faceIdWorking ?? p.faceIdWorking,
          cameraGenuine: v.cameraGenuine ?? p.cameraGenuine,
          chargingPortGenuine: v.chargingPortGenuine ?? p.chargingPortGenuine,
          speakerGenuine: v.speakerGenuine ?? p.speakerGenuine,
          hasDefects: v.hasDefects,
          stockQuantity: Math.min(v.stockQuantity, MAX_QTY),
        };
      })
    );
    if (!units.length) continue;

    // Photos: the listing with the most promo units first, no repeats.
    const seen = new Set<string>();
    const images = [...group]
      .sort((a, b) => b.variants.length - a.variants.length)
      .flatMap((p) => p.images)
      .filter((i) => !seen.has(i.url) && seen.add(i.url))
      .slice(0, 8)
      .map((i) => ({ ...i, color: photoColor.get(i.url) ?? null }));

    const cheapest = units.reduce((min, u) => (u.price < min.price ? u : min));
    const storages = [...new Set(units.map((u) => u.storage).filter((s): s is string => !!s))].sort(
      (a, b) => parseInt(a) * (/TB|To/i.test(a) ? 1024 : 1) - parseInt(b) * (/TB|To/i.test(b) ? 1024 : 1)
    );
    const all = optionsByModel.get(modelKey) ?? { colors: [], listings: [] };
    offers.push({
      slug,
      modelKey,
      options: {
        grades: GRADE_ORDER.filter((g) => all.listings.some((l) => l.grade === g)),
        storages: [...new Set(all.listings.map((l) => l.storage).filter((x): x is string => !!x))],
        colors: all.colors,
      },
      brandKey: modelKey.split("|")[0],
      name,
      brand: group[0].brand ?? "",
      facts,
      pageId: page?.id ?? null,
      endsAt: page?.endsAt ?? null,
      units,
      listingSlugs: group.map((p) => p.slug),
      images,
      addons: [],
      fromPrice: cheapest.price,
      normalFrom: cheapest.normalPrice,
      bestSaving: Math.max(...units.map((u) => u.normalPrice - u.price)),
      storages,
      rams: [
        ...new Set(
          group
            .map((p) => (p.specs as Record<string, unknown> | null)?.["RAM"])
            .filter((r): r is string => typeof r === "string" && !!r.trim())
            .map((r) => r.replace(/\s+/g, ""))
        ),
      ],
      grades: GRADE_ORDER.filter((g) => units.some((u) => u.grade === g)),
    });
  }

  // Biggest saving first (headers, /offres, the home page).
  return offers.sort((a, b) => b.bestSaving - a.bestSaving || a.name.localeCompare(b.name));
}

/** Every phone offer live right now (read once per page render). */
export const getPhoneOffers = cache(() => loadOffers("promo"));

/** Every phone model with units in stock: their permanent pages (/telephones/<model>). */
export const getModelPages = cache(() => loadOffers("model"));

/** One model's page, with its add-ons; null when nothing of it is in stock. */
export const getModelPage = cache(async (slug: string): Promise<PhoneOffer | null> => {
  const model = (await getModelPages()).find((o) => o.slug === slug);
  if (!model) return null;
  return { ...model, addons: await offerAddons(model) };
});

/** One model's offer, with its add-ons; null when it has no promo unit in stock. */
export const getPhoneOffer = cache(async (slug: string): Promise<PhoneOffer | null> => {
  const offer = (await getPhoneOffers()).find((o) => o.slug === slug);
  if (!offer) return null;
  return { ...offer, addons: await offerAddons(offer) };
});

// ── Brand pages (/offres/iphone, /offres/samsung) ───────────────────────
// Every promo unit of a brand on one page, for a campaign that advertises a
// single link. Built from the model offers above (so a model switched off
// in the ERP is left out here too); an ERP promo page with the brand
// page's slug switches the whole page off and counts its visits and orders.

export const BRAND_PAGES: Record<string, { slug: string; name: string }> = {
  apple: { slug: "iphone", name: "iPhone" },
  samsung: { slug: "samsung", name: "Samsung Galaxy" },
  xiaomi: { slug: "xiaomi", name: "Xiaomi" },
  honor: { slug: "honor", name: "Honor" },
};

export type BrandOffer = {
  slug: string;
  brandKey: string;
  /** "iPhone", "Samsung Galaxy" */
  name: string;
  brand: string;
  pageId: string | null;
  endsAt: Date | null;
  /** the brand's model offers, biggest saving first */
  models: PhoneOffer[];
  units: PhoneOfferUnit[];
  images: { url: string; altText: string | null }[];
  fromPrice: number;
  normalFrom: number;
  bestSaving: number;
  storages: string[];
  grades: string[];
};

async function loadBrandOffers(): Promise<BrandOffer[]> {
  const offers = await getPhoneOffers();
  const brands = Object.entries(BRAND_PAGES).filter(([key]) => offers.some((o) => o.brandKey === key));
  const pages = await prisma.landingPage.findMany({
    where: { slug: { in: brands.map(([, b]) => b.slug) } },
    select: { id: true, slug: true, active: true, startsAt: true, endsAt: true },
  });
  const out: BrandOffer[] = [];
  for (const [key, b] of brands) {
    const page = pages.find((p) => p.slug === b.slug);
    if (page && landingStatus(page) !== "live") continue;
    const models = offers.filter((o) => o.brandKey === key);
    const units = models.flatMap((o) => o.units);
    const cheapest = units.reduce((min, u) => (u.price < min.price ? u : min));
    out.push({
      slug: b.slug,
      brandKey: key,
      name: b.name,
      brand: models[0].brand,
      pageId: page?.id ?? null,
      endsAt: page?.endsAt ?? null,
      models,
      units,
      // One photo per model, then the rest.
      images: [...models.map((o) => o.images[0]).filter(Boolean), ...models.flatMap((o) => o.images.slice(1))].slice(0, 10),
      fromPrice: cheapest.price,
      normalFrom: cheapest.normalPrice,
      bestSaving: Math.max(...models.map((o) => o.bestSaving)),
      storages: [...new Set(models.flatMap((o) => o.storages))],
      grades: GRADE_ORDER.filter((g) => units.some((u) => u.grade === g)),
    });
  }
  return out;
}

/** Every brand page live right now (brands with at least one model on promo). */
export const getBrandOffers = cache(loadBrandOffers);

export async function getBrandOffer(slug: string): Promise<BrandOffer | null> {
  return (await getBrandOffers()).find((b) => b.slug === slug) ?? null;
}

/** The offer a listing's units are sold through (product page banner). */
export async function offerForListing(listingSlug: string): Promise<PhoneOffer | null> {
  return (await getPhoneOffers()).find((o) => o.listingSlugs.includes(listingSlug)) ?? null;
}

const ACCESSORY_SELECT = {
  id: true,
  slug: true,
  name: true,
  availability: true,
  source: true,
  recommendedSalePrice: true,
  internal: { select: { stockQuantity: true } },
  category: { select: { slug: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
} as const;

/**
 * Suggested add-ons: the model's compatible accessories in the ERP (Site web
 * → Catalogue → the phone), in stock. None while accessories aren't sold
 * online yet (ACCESSORIES_OPEN).
 */
export async function offerAddons(offer: Pick<PhoneOffer, "listingSlugs" | "facts">): Promise<OfferAddon[]> {
  if (!ACCESSORIES_OPEN) return [];
  const links = await prisma.productCompatibility.findMany({
    where: { compatibleWith: { slug: { in: offer.listingSlugs } }, product: { published: true, isPhone: false, variants: { none: {} } } },
    select: { product: { select: ACCESSORY_SELECT } },
  });
  let rows = links.map((l) => l.product);
  if (!rows.length && offer.facts?.port === "lightning") {
    rows = await prisma.product.findMany({
      where: { slug: { in: DEFAULT_LIGHTNING_ADDONS }, published: true, variants: { none: {} } },
      select: ACCESSORY_SELECT,
    });
  }
  const unique = new Map(rows.map((p) => [p.id, p]));
  return [...unique.values()]
    .filter((p) => p.availability === AvailabilityStatus.IN_STOCK && (p.source !== "ERP" || (p.internal?.stockQuantity ?? 0) > 0))
    .map((p) => ({
      key: p.slug,
      productId: p.id,
      name: p.name,
      categorySlug: p.category.slug,
      price: Number(p.recommendedSalePrice.toString()),
      image: p.images[0]?.url ?? null,
    }))
    .sort((x, y) => x.price - y.price || x.name.localeCompare(y.name));
}

/** Server-side check for an order: the unit must be a promo unit of this model, in stock right now. */
export async function resolveOfferUnit(slug: string, unitId: string, kind: "promo" | "model" = "promo") {
  const variant = await prisma.productVariant.findFirst({
    where: { id: unitId, ...(kind === "promo" ? PROMO_UNIT : IN_STOCK_UNIT), product: LISTING },
    select: { id: true, productId: true, product: { select: { modelKey: true } } },
  });
  if (!variant?.product.modelKey || offerSlug(variant.product.modelKey) !== slug) return null;
  return { id: variant.id, productId: variant.productId };
}
