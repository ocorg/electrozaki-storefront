import { prisma } from "./client";

// Public reads for packs. Packs are managed from the ERP ("Site web" →
// Packs), which writes this database directly.

// ── Public-safe ─────────────────────────────────────────────────────────

export async function getActiveBundlesForProduct(productId: string) {
  return prisma.bundle.findMany({
    // Every member must be on sale — a pack containing a hidden or sold-out
    // product can't be ordered, so it isn't offered either.
    where: {
      active: true,
      items: {
        some: { productId },
        every: { product: { published: true, availability: "IN_STOCK" } },
      },
    },
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
