import { cache } from "react";
import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

// Every option a phone model has had in the shop, available or not, so the
// pickers can show the ones out of stock crossed out instead of hiding them:
// the model's colours (the ERP's colour photos, plus any colour in stock)
// and its listings, one per grade + storage (a sold-out listing is kept,
// hidden, by the ERP's sync).

export type ModelListing = {
  slug: string;
  grade: string;
  storage: string | null;
  ram: string | null;
  available: boolean;
};

export type ModelOptions = { colors: string[]; listings: ModelListing[] };

const storageSize = (s: string | null) => (s ? parseInt(s) * (/TB|To/i.test(s) ? 1024 : 1) : 0);

export const getModelOptions = cache(async (modelKey: string): Promise<ModelOptions> => {
  const [photos, rows] = await Promise.all([
    prisma.modelPhoto.findMany({ where: { modelKey }, select: { color: true } }),
    prisma.product.findMany({
      where: { modelKey, isPhone: true, published: true },
      select: {
        slug: true,
        condition: true,
        specs: true,
        availability: true,
        variants: { where: { stockQuantity: { gt: 0 } }, select: { color: true } },
      },
    }),
  ]);
  const spec = (s: unknown, k: string) => {
    const v = (s as Record<string, unknown> | null)?.[k];
    return typeof v === "string" && v.trim() ? v.replace(/\s+/g, "") : null;
  };
  const colors = new Set(photos.map((p) => p.color));
  for (const r of rows) if (r.availability === AvailabilityStatus.IN_STOCK) for (const v of r.variants) if (v.color) colors.add(v.color);
  return {
    colors: [...colors].sort((a, b) => a.localeCompare(b, "fr")),
    listings: rows
      .map((r) => ({
        slug: r.slug,
        grade: r.condition,
        storage: spec(r.specs, "Stockage"),
        ram: spec(r.specs, "RAM"),
        available: r.availability === AvailabilityStatus.IN_STOCK && r.variants.length > 0,
      }))
      .sort((a, b) => storageSize(a.storage) - storageSize(b.storage)),
  };
});
