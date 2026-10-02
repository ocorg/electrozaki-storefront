import { cache } from "react";
import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/client";
import { landingStatus, type LandingStatus } from "@/lib/db/landing";
import { MAX_QTY } from "@/lib/db/cart-pricing";

// ─────────────────────────────────────────────────────────────────────────
// The iPhone 13 offer page (/offres/iphone-13): one phone, two free
// accessories, a few suggested add-ons, ordered in one form on the page.
//
// It is tied to the ERP promo page with the same slug ("Site web → Pages
// promo"): switching that page off takes the offer down, its views and
// orders are counted there. The offer price is OFFER_PRICE below; normal
// prices and stock always come from the database.
// ─────────────────────────────────────────────────────────────────────────

export const OFFER_SLUG = "iphone-13";

// One price for every phone of the offer, set here on the website (the ERP
// prices are left as they are, and the ERP page's discount is not used for
// it). A unit already priced lower in the ERP keeps its own price.
export const OFFER_PRICE = 3300;
// The price shown crossed out next to it ("au lieu de 3 400 DH", -100 DH) on
// every phone, even one priced lower in the ERP. Display only: what is
// charged is offerPrice().
export const OFFER_REFERENCE_PRICE = 3400;

/** What a unit costs on the offer, from its normal (ERP) price. */
export function offerPrice(normalPrice: number): number {
  return Math.min(normalPrice, OFFER_PRICE);
}

/** Listings whose in-stock units are sold here (clean units only: no "pièces remplacées"). */
export const PHONE_SLUGS = ["iphone-13-128gb-tres-bon-etat"];

// Free items and suggested add-ons come from the ERP: the listing's
// "compatible accessories" (Site web → Catalogue → the phone), where
// "Cadeau" ticked = free with the phone, unticked = suggested add-on. Until
// that list is filled in, these defaults are used (by product slug).
const DEFAULT_INCLUDED = ["iphone-transparent", "crystale"];
const DEFAULT_ADDONS = ["apple-c-l-25w", "apple-cable-c-l-1m", "apple-iphone-20w-originale", "mm-300df"];

export type OfferUnit = {
  id: string;
  productId: string;
  name: string;
  color: string | null;
  batteryHealthPercent: number | null;
  /** offer price, whole DH */
  price: number;
  /** price shown crossed out: the ERP price, at least OFFER_REFERENCE_PRICE (display only) */
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

/** key = the product slug (labels in the page copy are keyed by it). */
export type OfferAccessory = { key: string; productId: string; name: string; categorySlug: string; price: number; image: string | null };

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
  category: { select: { slug: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
} as const;

type AccessoryRow = {
  id: string;
  slug: string;
  name: string;
  availability: string;
  source: string;
  recommendedSalePrice: { toString(): string };
  internal: { stockQuantity: number } | null;
  category: { slug: string };
  images: { url: string }[];
};

function toAccessory(p: AccessoryRow): OfferAccessory {
  return {
    key: p.slug,
    productId: p.id,
    name: p.name,
    categorySlug: p.category.slug,
    price: Number(p.recommendedSalePrice.toString()),
    image: p.images[0]?.url ?? null,
  };
}

/** Free items and add-ons that are published and in stock right now (see the ERP note above). */
export async function offerAccessoryLists(): Promise<{ included: OfferAccessory[]; addons: OfferAccessory[] }> {
  const links = await prisma.productCompatibility.findMany({
    where: { compatibleWith: { slug: { in: PHONE_SLUGS } }, product: { published: true, isPhone: false, variants: { none: {} } } },
    select: { isGiftOption: true, product: { select: ACCESSORY_SELECT } },
  });

  if (links.length) {
    // One entry per accessory (it may be linked to several listings); free wins.
    const byId = new Map<string, { gift: boolean; p: AccessoryRow }>();
    for (const l of links) {
      const seen = byId.get(l.product.id);
      byId.set(l.product.id, { gift: (seen?.gift ?? false) || l.isGiftOption, p: l.product });
    }
    const rows = [...byId.values()].filter((r) => accessoryInStock(r.p));
    const byPrice = (x: OfferAccessory, y: OfferAccessory) => x.price - y.price || x.name.localeCompare(y.name);
    return {
      included: rows.filter((r) => r.gift).map((r) => toAccessory(r.p)).sort(byPrice),
      addons: rows.filter((r) => !r.gift).map((r) => toAccessory(r.p)).sort(byPrice),
    };
  }

  const rows = await prisma.product.findMany({
    where: { slug: { in: [...DEFAULT_INCLUDED, ...DEFAULT_ADDONS] }, published: true, variants: { none: {} } },
    select: ACCESSORY_SELECT,
  });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const pick = (slugs: string[]) =>
    slugs.flatMap((slug) => {
      const p = bySlug.get(slug);
      return p && accessoryInStock(p) ? [toAccessory(p)] : [];
    });
  return { included: pick(DEFAULT_INCLUDED), addons: pick(DEFAULT_ADDONS) };
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

/** The offer as shown right now (read once per page render: header, page and banners share it). */
export const getIphone13Offer = cache(loadIphone13Offer);

async function loadIphone13Offer(): Promise<OfferData> {
  const page = await getOfferPage();
  const status: LandingStatus = page ? landingStatus(page) : "off";
  const empty: OfferData = { pageId: page?.id ?? null, status, units: [], images: [], included: [], addons: [], fromPrice: null, normalFrom: null };
  if (!page || status !== "live") return empty;

  const [phones, { included, addons }] = await Promise.all([
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
    offerAccessoryLists(),
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
          price: offerPrice(normalPrice),
          normalPrice: Math.max(normalPrice, OFFER_REFERENCE_PRICE),
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
