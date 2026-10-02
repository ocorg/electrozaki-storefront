import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/client";
import { landingPrice, landingStatus, type LandingStatus } from "@/lib/db/landing";
import { MAX_QTY } from "@/lib/db/cart-pricing";

// ─────────────────────────────────────────────────────────────────────────
// The iPhone 13 offer page (/offres/iphone-13): one phone, two free
// accessories, a few suggested add-ons, ordered in one form on the page.
//
// It is tied to the ERP promo page with the same slug ("Site web → Pages
// promo"): switching that page off takes the offer down, its discount sets
// the offer price, its views and orders are counted there. Products are
// picked here by slug; their prices and stock always come from the database.
// ─────────────────────────────────────────────────────────────────────────

export const OFFER_SLUG = "iphone-13";

/** Listings whose in-stock units are sold here (clean units only: no "pièces remplacées"). */
const PHONE_SLUGS = ["iphone-13-128gb-tres-bon-etat"];

/** Given free with the phone. */
export const INCLUDED = [
  { key: "case", slug: "iphone-transparent" },
  { key: "glass", slug: "crystale" },
] as const;

/** Suggested add-ons, at their normal price. */
export const ADDONS = [
  { key: "charger25", slug: "apple-c-l-25w" },
  { key: "cable", slug: "apple-cable-c-l-1m" },
  { key: "head20", slug: "apple-iphone-20w-originale" },
  { key: "sticky", slug: "mm-300df" },
] as const;

export type IncludedKey = (typeof INCLUDED)[number]["key"];
export type AddonKey = (typeof ADDONS)[number]["key"];

export type OfferUnit = {
  id: string;
  productId: string;
  name: string;
  color: string | null;
  batteryHealthPercent: number | null;
  /** offer price, whole DH */
  price: number;
  /** normal site price, whole DH */
  normalPrice: number;
  imageUrl: string | null;
  // Condition, as on the product page (unit value, else the listing's).
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

export type OfferAccessory = { key: string; productId: string; name: string; price: number; image: string | null };

/** Stock check shared by the page and the order action. */
function accessoryInStock(p: { availability: string; source: string; internal: { stockQuantity: number } | null }): boolean {
  if (p.availability !== AvailabilityStatus.IN_STOCK) return false;
  return p.source !== "ERP" || (p.internal?.stockQuantity ?? 0) > 0;
}

const ACCESSORY_SELECT = {
  id: true,
  slug: true,
  name: true,
  availability: true,
  source: true,
  recommendedSalePrice: true,
  internal: { select: { stockQuantity: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
} as const;

/** Accessories (by key) that are published and in stock right now. */
export async function offerAccessories<K extends string>(list: readonly { key: K; slug: string }[]) {
  const rows = await prisma.product.findMany({
    where: { slug: { in: list.map((a) => a.slug) }, published: true, variants: { none: {} } },
    select: ACCESSORY_SELECT,
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return list.flatMap((a) => {
    const p = bySlug.get(a.slug);
    if (!p || !accessoryInStock(p)) return [];
    return [{ key: a.key, productId: p.id, name: p.name, price: Number(p.recommendedSalePrice.toString()), image: p.images[0]?.url ?? null }];
  });
}

export async function getOfferPage() {
  return prisma.landingPage.findUnique({
    where: { slug: OFFER_SLUG },
    select: { id: true, title: true, active: true, startsAt: true, endsAt: true, discountType: true, discountValue: true },
  });
}

export type OfferData = {
  pageId: string | null;
  status: LandingStatus;
  units: OfferUnit[];
  images: { url: string; altText: string | null }[];
  included: OfferAccessory[];
  addons: OfferAccessory[];
  /** lowest offer price among units in stock (null = sold out) */
  fromPrice: number | null;
  normalFrom: number | null;
};

export async function getIphone13Offer(): Promise<OfferData> {
  const page = await getOfferPage();
  const status: LandingStatus = page ? landingStatus(page) : "off";
  const empty: OfferData = { pageId: page?.id ?? null, status, units: [], images: [], included: [], addons: [], fromPrice: null, normalFrom: null };
  if (!page || status !== "live") return empty;

  const [phones, included, addons] = await Promise.all([
    prisma.product.findMany({
      where: { slug: { in: PHONE_SLUGS }, published: true, availability: AvailabilityStatus.IN_STOCK },
      select: {
        id: true,
        name: true,
        recommendedSalePrice: true,
        images: { select: { url: true, altText: true }, orderBy: { sortOrder: "asc" } },
        batteryGenuine: true,
        screenGenuine: true,
        faceIdWorking: true,
        cameraGenuine: true,
        chargingPortGenuine: true,
        speakerGenuine: true,
        variants: {
          where: { stockQuantity: { gt: 0 } },
          select: {
            id: true,
            name: true,
            color: true,
            batteryHealthPercent: true,
            priceOverride: true,
            imageUrl: true,
            stockQuantity: true,
            batteryGenuine: true,
            screenGenuine: true,
            faceIdWorking: true,
            cameraGenuine: true,
            chargingPortGenuine: true,
            speakerGenuine: true,
            hasDefects: true,
          },
        },
      },
    }),
    offerAccessories(INCLUDED),
    offerAccessories(ADDONS),
  ]);

  const units: OfferUnit[] = phones.flatMap((p) =>
    p.variants
      // Clean units only, even if one slips into a clean listing.
      .filter((v) => !v.hasDefects && v.screenGenuine !== false && v.batteryGenuine !== false)
      .map((v) => {
        const normalPrice = Number((v.priceOverride ?? p.recommendedSalePrice).toString());
        return {
          id: v.id,
          productId: p.id,
          name: v.name,
          color: v.color,
          batteryHealthPercent: v.batteryHealthPercent,
          price: landingPrice(page, normalPrice),
          normalPrice,
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
  const cheapest = units.reduce<OfferUnit | null>((min, u) => (!min || u.price < min.price ? u : min), null);

  return {
    pageId: page.id,
    status,
    units,
    images: phones[0]?.images ?? [],
    included,
    addons,
    fromPrice: cheapest?.price ?? null,
    normalFrom: cheapest?.normalPrice ?? null,
  };
}

/** Server-side checks for an order: the unit must be one this page sells, right now. */
export async function resolveOfferUnit(unitId: string) {
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: unitId,
      stockQuantity: { gt: 0 },
      hasDefects: false,
      product: { slug: { in: PHONE_SLUGS }, published: true, availability: AvailabilityStatus.IN_STOCK },
    },
    select: { id: true, productId: true, screenGenuine: true, batteryGenuine: true },
  });
  if (!variant || variant.screenGenuine === false || variant.batteryGenuine === false) return null;
  return variant;
}
