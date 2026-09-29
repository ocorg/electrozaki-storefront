import type { MetadataRoute } from "next";
import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/client";
import { getAisles } from "@/lib/db/storefront";
import { REPAIR_TOPICS } from "@/lib/repair-faq";
import { absoluteUrl } from "@/lib/site";

// Rebuilt at most once an hour: products come and go with the ERP sync.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [aisles, products] = await Promise.all([
    getAisles(),
    prisma.product.findMany({
      where: { published: true, availability: { not: AvailabilityStatus.DISCONTINUED } },
      select: { slug: true, updatedAt: true, images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 } },
    }),
  ]);
  const parents = [...new Set(aisles.map((a) => a.parentSlug).filter((s): s is string => Boolean(s)))];

  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/reparation"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.4 },
    ...parents.map((slug) => ({ url: absoluteUrl(`/collections/${slug}`), changeFrequency: "daily" as const, priority: 0.9 })),
    ...aisles.map((a) => ({ url: absoluteUrl(`/collections/${a.slug}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...Object.keys(REPAIR_TOPICS).map((slug) => ({
      url: absoluteUrl(`/reparation/${slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/products/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(p.images[0] ? { images: [p.images[0].url] } : {}),
    })),
  ];
}
