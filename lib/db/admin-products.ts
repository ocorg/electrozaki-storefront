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
      variants: { select: { stockQuantity: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// A product with variants tracks stock per variant (a specific color/
// storage combo, or a specific reconditioned unit, can sell out on its
// own) — internal.stockQuantity only means something for a product with
// no variants. This is the one place that distinction gets resolved, so
// the admin table and the dashboard's low-stock count never disagree.
export function effectiveStock(product: {
  internal: { stockQuantity: number } | null;
  variants: { stockQuantity: number }[];
}): number {
  if (product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  }
  return product.internal?.stockQuantity ?? 0;
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
  // "Clean batch" attributes
  color?: string | null;
  storageLabel?: string | null;
  imageUrl?: string | null;
  stockQuantity: number;
  // "Faulty batch" attributes — same shape as the product-level fields,
  // each independently nullable so a variant only overrides what actually
  // differs for that unit.
  batteryHealthPercent?: number | null;
  faceIdWorking?: boolean | null;
  screenGenuine?: boolean | null;
  batteryGenuine?: boolean | null;
  cameraGenuine?: boolean | null;
  chargingPortGenuine?: boolean | null;
  speakerGenuine?: boolean | null;
  hasDefects?: boolean;
  transparencyNotes?: string | null;
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
  cameraGenuine?: boolean | null;
  chargingPortGenuine?: boolean | null;
  speakerGenuine?: boolean | null;
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

function variantCreateData(v: ProductVariantInput) {
  return {
    name: v.name,
    priceOverride: v.priceOverride ?? undefined,
    skuOrRef: v.skuOrRef ?? undefined,
    color: v.color ?? undefined,
    storageLabel: v.storageLabel ?? undefined,
    imageUrl: v.imageUrl ?? undefined,
    stockQuantity: v.stockQuantity,
    batteryHealthPercent: v.batteryHealthPercent ?? undefined,
    faceIdWorking: v.faceIdWorking ?? undefined,
    screenGenuine: v.screenGenuine ?? undefined,
    batteryGenuine: v.batteryGenuine ?? undefined,
    cameraGenuine: v.cameraGenuine ?? undefined,
    chargingPortGenuine: v.chargingPortGenuine ?? undefined,
    speakerGenuine: v.speakerGenuine ?? undefined,
    hasDefects: v.hasDefects ?? false,
    transparencyNotes: v.transparencyNotes ?? undefined,
  };
}

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
      cameraGenuine: input.cameraGenuine,
      chargingPortGenuine: input.chargingPortGenuine,
      speakerGenuine: input.speakerGenuine,
      hasDefects: input.hasDefects,
      transparencyNotes: input.transparencyNotes,
      images: input.imageUrl ? { create: [{ url: input.imageUrl, sortOrder: 0 }] } : undefined,
      variants: input.variants.length
        ? { create: input.variants.map(variantCreateData) }
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
        cameraGenuine: input.cameraGenuine,
        chargingPortGenuine: input.chargingPortGenuine,
        speakerGenuine: input.speakerGenuine,
        hasDefects: input.hasDefects,
        transparencyNotes: input.transparencyNotes,
        variants: input.variants.length
          ? { create: input.variants.map(variantCreateData) }
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
  const products = await prisma.product.findMany({
    where: { availability: { in: ["IN_STOCK", "COMING_SOON"] } },
    select: {
      internal: { select: { stockQuantity: true } },
      variants: { select: { stockQuantity: true } },
    },
  });
  return products.filter((p) => effectiveStock(p) <= threshold).length;
}
