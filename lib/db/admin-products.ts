import { prisma } from "./client";

// Admin-only reads/writes — deliberately kept out of lib/db/public-products.ts,
// which exists specifically to be the *only* file allowed to read products
// for the public storefront. This file is the mirror for app/admin routes:
// it's allowed (and needs) to touch ProductInternal.

export async function listAdminProducts() {
  return prisma.product.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      brand: true,
      condition: true,
      availability: true,
      recommendedSalePrice: true,
      compareAtPrice: true,
      category: { select: { id: true, name: true } },
      images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
      internal: { select: { stockQuantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      internal: true,
    },
  });
}

export type ProductVariantInput = {
  id?: string;
  name: string;
  priceOverride?: number | null;
  skuOrRef?: string | null;
};

export type ProductInput = {
  slug: string;
  name: string;
  brand?: string | null;
  categoryId: string;
  condition: "NEUF" | "TRES_BON" | "BON" | "PIECES_REMPLACEES";
  isPhone: boolean;
  description?: string | null;
  specs?: Record<string, string> | null;
  recommendedSalePrice: number;
  compareAtPrice?: number | null;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "COMING_SOON" | "DISCONTINUED";
  tags: string[];
  batteryHealthPercent?: number | null;
  faceIdWorking?: boolean | null;
  screenGenuine?: boolean | null;
  batteryGenuine?: boolean | null;
  hasDefects: boolean;
  transparencyNotes?: string | null;
  imageUrl?: string | null;
  variants: ProductVariantInput[];
  // ProductInternal
  purchasePrice: number;
  minSalePrice: number;
  stockQuantity: number;
  supplier?: string | null;
  sourceNote?: string | null;
  internalNotes?: string | null;
};

export async function createProduct(input: ProductInput) {
  return prisma.product.create({
    data: {
      slug: input.slug,
      name: input.name,
      brand: input.brand,
      categoryId: input.categoryId,
      condition: input.condition,
      isPhone: input.isPhone,
      description: input.description,
      specs: input.specs ?? undefined,
      recommendedSalePrice: input.recommendedSalePrice,
      compareAtPrice: input.compareAtPrice,
      availability: input.availability,
      tags: input.tags,
      batteryHealthPercent: input.batteryHealthPercent,
      faceIdWorking: input.faceIdWorking,
      screenGenuine: input.screenGenuine,
      batteryGenuine: input.batteryGenuine,
      hasDefects: input.hasDefects,
      transparencyNotes: input.transparencyNotes,
      images: input.imageUrl ? { create: [{ url: input.imageUrl, sortOrder: 0 }] } : undefined,
      variants: input.variants.length
        ? {
            create: input.variants.map((v) => ({
              name: v.name,
              priceOverride: v.priceOverride ?? undefined,
              skuOrRef: v.skuOrRef ?? undefined,
            })),
          }
        : undefined,
      internal: {
        create: {
          purchasePrice: input.purchasePrice,
          minSalePrice: input.minSalePrice,
          stockQuantity: input.stockQuantity,
          supplier: input.supplier,
          sourceNote: input.sourceNote,
          internalNotes: input.internalNotes,
        },
      },
    },
  });
}

// Variants are replaced wholesale on every edit (delete + recreate) rather
// than diffed — simplest correct approach for a form that always submits
// the full current list, and variant rows carry no other data (order
// history snapshots the name/price at time of purchase, so deleting a
// variant here never rewrites a past order).
export async function updateProduct(id: string, input: ProductInput) {
  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        slug: input.slug,
        name: input.name,
        brand: input.brand,
        categoryId: input.categoryId,
        condition: input.condition,
        isPhone: input.isPhone,
        description: input.description,
        specs: input.specs ?? undefined,
        recommendedSalePrice: input.recommendedSalePrice,
        compareAtPrice: input.compareAtPrice,
        availability: input.availability,
        tags: input.tags,
        batteryHealthPercent: input.batteryHealthPercent,
        faceIdWorking: input.faceIdWorking,
        screenGenuine: input.screenGenuine,
        batteryGenuine: input.batteryGenuine,
        hasDefects: input.hasDefects,
        transparencyNotes: input.transparencyNotes,
        variants: input.variants.length
          ? {
              create: input.variants.map((v) => ({
                name: v.name,
                priceOverride: v.priceOverride ?? undefined,
                skuOrRef: v.skuOrRef ?? undefined,
              })),
            }
          : undefined,
        internal: {
          upsert: {
            create: {
              purchasePrice: input.purchasePrice,
              minSalePrice: input.minSalePrice,
              stockQuantity: input.stockQuantity,
              supplier: input.supplier,
              sourceNote: input.sourceNote,
              internalNotes: input.internalNotes,
            },
            update: {
              purchasePrice: input.purchasePrice,
              minSalePrice: input.minSalePrice,
              stockQuantity: input.stockQuantity,
              supplier: input.supplier,
              sourceNote: input.sourceNote,
              internalNotes: input.internalNotes,
            },
          },
        },
      },
    }),
  ]);

  if (input.imageUrl) {
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: id },
      orderBy: { sortOrder: "asc" },
    });
    if (existingImage) {
      await prisma.productImage.update({ where: { id: existingImage.id }, data: { url: input.imageUrl } });
    } else {
      await prisma.productImage.create({ data: { productId: id, url: input.imageUrl, sortOrder: 0 } });
    }
  }
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}

// Staff-facing "needs attention" signal on the dashboard.
export async function countLowStockProducts(threshold = 3): Promise<number> {
  return prisma.productInternal.count({
    where: {
      stockQuantity: { lte: threshold },
      product: { availability: { in: ["IN_STOCK", "COMING_SOON"] } },
    },
  });
}
