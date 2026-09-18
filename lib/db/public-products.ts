import { AvailabilityStatus } from "@/generated/prisma/enums";
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
  batteryHealthPercent: true,
  hasDefects: true,
  transparencyNotes: true,
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
  // Phase-2: for a phone, its gift-eligible accessory choices; for an
  // accessory, this is empty (compatibility runs the other direction below).
  compatibleAccessories: {
    select: {
      isGiftOption: true,
      product: { select: { id: true, slug: true, name: true } },
    },
  },
  // Phase-2: for an accessory, the phone models it's confirmed to fit.
  compatibleWithPhones: {
    select: {
      compatibleWith: { select: { id: true, slug: true, name: true } },
    },
  },
} as const;

// Hand-written to match PUBLIC_PRODUCT_SELECT, rather than derived through
// Prisma's Prisma.ProductGetPayload<...> generic. Prisma 7's newer generator
// moved that generic machinery to a different internal path than the one
// documented for the classic generator, and it's not worth re-coupling this
// file to wherever it lives this version — a plain interface here is exactly
// as type-safe for our own code and doesn't break the next time Prisma
// reorganizes its internals.
export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  condition: string;
  description: string | null;
  specs: unknown;
  recommendedSalePrice: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  availability: AvailabilityStatus;
  tags: string[];
  batteryHealthPercent: number | null;
  hasDefects: boolean;
  transparencyNotes: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string; slug: string };
  images: { url: string; altText: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    priceOverride: { toString(): string } | null;
    skuOrRef: string | null;
  }[];
  compatibleAccessories: {
    isGiftOption: boolean;
    product: { id: string; slug: string; name: string };
  }[];
  compatibleWithPhones: {
    compatibleWith: { id: string; slug: string; name: string };
  }[];
}

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
