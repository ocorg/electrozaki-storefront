import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

// ─────────────────────────────────────────────────────────────────────────
// Promo pages (/offres/[slug]), managed from the ERP ("Site web → Pages
// promo"). A page lists what is IN STOCK right now from a category and/or
// hand-picked products — never a sold-out item. Its discount only applies
// while the page is live, and only through the server (cart-pricing.ts).
// Products with variants (a phone's units) are left out: the page adds to
// the cart in one tap, without a unit/colour picker.
// ─────────────────────────────────────────────────────────────────────────

export type LandingStatus = "live" | "scheduled" | "ended" | "off";

type PageTiming = { active: boolean; startsAt: Date | null; endsAt: Date | null };

export function landingStatus(page: PageTiming, now = new Date()): LandingStatus {
  if (!page.active) return "off";
  if (page.startsAt && now < page.startsAt) return "scheduled";
  if (page.endsAt && now > page.endsAt) return "ended";
  return "live";
}

type PageDiscount = { discountType: "PERCENTAGE" | "FIXED_AMOUNT" | null; discountValue: { toString(): string } | null };

/** The page's promo price for a normal price (whole dirhams, never below 1). */
export function landingPrice(page: PageDiscount, normal: number): number {
  const value = page.discountValue === null ? 0 : Number(page.discountValue.toString());
  if (!page.discountType || !(value > 0)) return normal;
  const price = page.discountType === "PERCENTAGE" ? Math.round(normal * (1 - Math.min(value, 90) / 100)) : Math.round(normal - value);
  return Math.max(1, Math.min(normal, price));
}

const ON_SALE = {
  published: true,
  availability: AvailabilityStatus.IN_STOCK,
  variants: { none: {} },
} as const;

/** Ids of the products a page offers right now, explicit ones first. */
export async function landingProductIds(pageId: string): Promise<string[]> {
  const page = await prisma.landingPage.findUnique({
    where: { id: pageId },
    select: {
      categoryId: true,
      category: { select: { children: { select: { id: true } } } },
      products: { select: { productId: true }, orderBy: { sortOrder: "asc" } },
    },
  });
  if (!page) return [];
  const categoryIds = page.categoryId ? [page.categoryId, ...(page.category?.children.map((c) => c.id) ?? [])] : [];
  const rows = await prisma.product.findMany({
    where: {
      ...ON_SALE,
      OR: [
        { id: { in: page.products.map((p) => p.productId) } },
        ...(categoryIds.length ? [{ categoryId: { in: categoryIds } }] : []),
      ],
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  const explicit = page.products.map((p) => p.productId);
  const inStock = new Set(rows.map((r) => r.id));
  return [...explicit.filter((id) => inStock.has(id)), ...rows.map((r) => r.id).filter((id) => !explicit.includes(id))];
}

export async function getLandingPage(slug: string) {
  const page = await prisma.landingPage.findUnique({
    where: { slug },
    include: { promoCode: { select: { code: true, type: true, value: true, active: true, expiresAt: true } } },
  });
  if (!page) return null;
  const status = landingStatus(page);
  const ids = status === "live" ? await landingProductIds(page.id) : [];
  const products = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          slug: true,
          name: true,
          brand: true,
          recommendedSalePrice: true,
          images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));
  return {
    page,
    status,
    products: ids
      .map((id) => byId.get(id))
      .filter((p): p is (typeof products)[number] => Boolean(p))
      .map((p) => {
        const normal = Number(p.recommendedSalePrice.toString());
        return { id: p.id, slug: p.slug, name: p.name, brand: p.brand, image: p.images[0]?.url ?? null, normal, price: landingPrice(page, normal) };
      }),
  };
}

export async function countLandingView(pageId: string) {
  await prisma.landingPage.updateMany({ where: { id: pageId }, data: { views: { increment: 1 } } });
}
