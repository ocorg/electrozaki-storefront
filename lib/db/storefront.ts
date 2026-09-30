import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";
import { getFeaturedProducts, type PublicProduct } from "./public-products";

// The home page's shop front: which aisles have something on sale, and from
// what price. Read-only, public fields only (no `internal` relation).
//
// Stock quantities are the owner's private business figures: they're used
// here to hide empty aisles and to order aisles, but no count is ever
// returned — so none can reach a page, or the data sent to the browser.

const ON_SALE = {
  published: true,
  availability: { not: AvailabilityStatus.DISCONTINUED },
} as const;

export type AisleStat = {
  slug: string;
  name: string;
  fromPrice: number | null;
  parentSlug: string | null;
};

/**
 * Every leaf category that actually has something on sale, with its
 * cheapest price. Empty categories (created in the ERP but with nothing
 * published yet) are left out, so no tile lands on an empty page.
 */
export async function getAisles(): Promise<AisleStat[]> {
  const [categories, groups] = await Promise.all([
    prisma.category.findMany({
      where: { children: { none: {} } },
      select: {
        id: true,
        name: true,
        slug: true,
        sortOrder: true,
        parent: { select: { slug: true, sortOrder: true } },
      },
    }),
    prisma.product.groupBy({
      by: ["categoryId"],
      where: ON_SALE,
      _count: { _all: true },
      _min: { recommendedSalePrice: true },
    }),
  ]);
  const byId = new Map(groups.map((g) => [g.categoryId, g]));

  return categories
    .filter((c) => (byId.get(c.id)?._count._all ?? 0) > 0)
    .sort((a, b) => {
      const ga = a.parent?.sortOrder ?? a.sortOrder;
      const gb = b.parent?.sortOrder ?? b.sortOrder;
      if (ga !== gb) return ga - gb;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      // Same position (ERP-created aisles all sit at 100): biggest first.
      return (byId.get(b.id)?._count._all ?? 0) - (byId.get(a.id)?._count._all ?? 0);
    })
    .map((c) => {
      const g = byId.get(c.id)!;
      const min = g._min.recommendedSalePrice;
      return {
        slug: c.slug,
        name: c.name,
        fromPrice: min ? Number(min.toString()) : null,
        parentSlug: c.parent?.slug ?? null,
      };
    });
}

/** Distinct brands on sale, most stocked first (for the brand ticker). */
export async function getBrands(limit = 14): Promise<string[]> {
  const rows = await prisma.product.groupBy({
    by: ["brand"],
    where: { ...ON_SALE, brand: { not: null } },
    _count: { _all: true },
  });
  // Brands are typed by hand in the ERP ("APPLE", "Apple", "Hibro", "HIBRO"):
  // merge case variants and show them in title case.
  const merged = new Map<string, { name: string; count: number }>();
  for (const r of rows) {
    const raw = (r.brand ?? "").trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    const prev = merged.get(key);
    const pretty = raw === raw.toUpperCase() && raw.length > 3 ? raw[0] + raw.slice(1).toLowerCase() : raw;
    merged.set(key, { name: prev?.name ?? pretty, count: (prev?.count ?? 0) + r._count._all });
  }
  return [...merged.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((b) => b.name);
}

export type ShowcasePhone = {
  slug: string;
  name: string;
  image: string | null;
  price: number;
  fromPrice: boolean;
  condition: string;
  battery: number | null;
};

/**
 * Phones in stock for the hero's "lock screen" notifications: photographed
 * ones first, one per model name, cheapest unit's battery and price.
 */
export async function getShowcasePhones(limit = 6): Promise<ShowcasePhone[]> {
  const rows = await prisma.product.findMany({
    where: { published: true, isPhone: true, availability: AvailabilityStatus.IN_STOCK },
    select: {
      slug: true,
      name: true,
      condition: true,
      recommendedSalePrice: true,
      batteryHealthPercent: true,
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      variants: {
        where: { stockQuantity: { gt: 0 } },
        select: { priceOverride: true, batteryHealthPercent: true },
      },
    },
    orderBy: [{ images: { _count: "desc" } }, { createdAt: "desc" }],
    take: limit * 3,
  });

  const seen = new Set<string>();
  const out: ShowcasePhone[] = [];
  for (const r of rows) {
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    const units = r.variants
      .map((v) => ({ price: v.priceOverride ? Number(v.priceOverride.toString()) : null, battery: v.batteryHealthPercent }))
      .filter((u): u is { price: number; battery: number | null } => u.price !== null)
      .sort((a, b) => a.price - b.price);
    out.push({
      slug: r.slug,
      name: r.name,
      image: r.images[0]?.url ?? null,
      price: units[0]?.price ?? Number(r.recommendedSalePrice.toString()),
      fromPrice: new Set(units.map((u) => u.price)).size > 1,
      condition: r.condition,
      battery: units[0]?.battery ?? r.batteryHealthPercent,
    });
    if (out.length >= limit) break;
  }
  return out;
}

/** The home page's two shelves: phones (photographed first), accessories. */
export async function getHomeShelves(): Promise<{ phones: PublicProduct[]; accessories: PublicProduct[] }> {
  const [phones, accessories] = await Promise.all([
    getFeaturedProducts(8, { isPhone: true }),
    getFeaturedProducts(12, { isPhone: false }),
  ]);
  return { phones, accessories };
}
