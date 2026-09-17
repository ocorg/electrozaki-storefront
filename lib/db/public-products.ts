import { Prisma, AvailabilityStatus } from "@/generated/prisma";
import { prisma } from "./client";

// ─────────────────────────────────────────────────────────────────────────
// THIS IS THE FILE deliverable 1's schema comment pointed to.
// Every page under app/(storefront) that needs product data imports FROM
// HERE — never `prisma.product.findMany(...)` directly in a page file.
// PUBLIC_PRODUCT_SELECT below is an explicit whitelist: it can never
// accidentally return `internal` (purchase price, supplier, stock count)
// because that relation is simply never named in the select.
// ─────────────────────────────────────────────────────────────────────────

const PUBLIC_PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  condition: true,
  description: true,
  specs: true,
  recommendedSalePrice: true,
  compareAtPrice: true,
  availability: true,
  tags: true,
  metaTitle: true,
  metaDescription: true,
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: { url: true, altText: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
  variants: {
    select: { id: true, name: true, priceOverride: true, skuOrRef: true },
  },
} satisfies Prisma.ProductSelect;

export type PublicProduct = Prisma.ProductGetPayload<{
  select: typeof PUBLIC_PRODUCT_SELECT;
}>;

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  return prisma.product.findUnique({
    where: { slug },
    select: PUBLIC_PRODUCT_SELECT,
  });
}

export async function getProductsByCategorySlug(
  categorySlug: string
): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: {
      category: { slug: categorySlug },
      availability: { not: AvailabilityStatus.DISCONTINUED },
    },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

export async function searchProducts(query: string): Promise<PublicProduct[]> {
  const q = query.trim();
  if (!q) return [];

  return prisma.product.findMany({
    where: {
      availability: { not: AvailabilityStatus.DISCONTINUED },
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    },
    select: PUBLIC_PRODUCT_SELECT,
    take: 30,
  });
}

export async function getFeaturedProducts(limit = 8): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: { availability: AvailabilityStatus.IN_STOCK },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
