import { prisma } from "./client";

// One file for both public-safe and admin-only reads/writes, matching the
// existing precedent in lib/db/order-requests.ts — Bundle (unlike Product)
// has no internal/cost data to protect, so there's no security reason to
// split it the way public-products.ts is split from admin-products.ts.

// ── Public-safe ─────────────────────────────────────────────────────────

export async function getActiveBundlesForProduct(productId: string) {
  return prisma.bundle.findMany({
    where: { active: true, items: { some: { productId } } },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              recommendedSalePrice: true,
              isPhone: true,
              images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });
}

// ── Admin-only ──────────────────────────────────────────────────────────

export async function listBundles() {
  return prisma.bundle.findMany({
    include: {
      items: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export type BundleItemInput = { productId: string; quantity: number };

export type BundleInput = {
  name: string;
  slug: string;
  description?: string | null;
  bundlePrice: number;
  active: boolean;
  items: BundleItemInput[];
};

export async function createBundle(input: BundleInput) {
  return prisma.bundle.create({
    data: {
      name: input.name,
      slug: input.slug,
      description: input.description,
      bundlePrice: input.bundlePrice,
      active: input.active,
      items: { create: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
    },
  });
}

export async function updateBundle(id: string, input: BundleInput) {
  await prisma.$transaction([
    prisma.bundleItem.deleteMany({ where: { bundleId: id } }),
    prisma.bundle.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        bundlePrice: input.bundlePrice,
        active: input.active,
        items: { create: input.items.map((i) => ({ productId: i.productId, quantity: i.quantity })) },
      },
    }),
  ]);
}

export async function deleteBundle(id: string) {
  await prisma.bundle.delete({ where: { id } });
}
