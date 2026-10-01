import type { MetadataRoute } from "next";
import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/client";
import { getAisles } from "@/lib/db/storefront";
import { REPAIR_SLUGS } from "@/lib/repair-faq";
import { LOCALES } from "@/lib/i18n/config";
import { alternates } from "@/lib/i18n/seo";
import { absoluteUrl } from "@/lib/site";

// Rebuilt at most once an hour: products come and go with the ERP sync.
export const revalidate = 3600;

type Entry = MetadataRoute.Sitemap[number];

/** One entry per language for an unprefixed path, each listing its other-language versions. */
function localized(path: string, extra: Omit<Entry, "url" | "alternates">): Entry[] {
  return LOCALES.map((locale) => {
    const alt = alternates(locale, path);
    return {
      ...extra,
      url: absoluteUrl(alt.canonical),
      alternates: {
        languages: Object.fromEntries(Object.entries(alt.languages).map(([code, href]) => [code, absoluteUrl(href)])),
      },
    };
  });
}

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
    ...localized("/", { changeFrequency: "daily", priority: 1 }),
    ...localized("/reparation", { changeFrequency: "monthly", priority: 0.8 }),
    ...localized("/contact", { changeFrequency: "yearly", priority: 0.4 }),
    ...parents.flatMap((slug) => localized(`/collections/${slug}`, { changeFrequency: "daily", priority: 0.9 })),
    ...aisles.flatMap((a) => localized(`/collections/${a.slug}`, { changeFrequency: "daily", priority: 0.8 })),
    ...REPAIR_SLUGS.flatMap((slug) => localized(`/reparation/${slug}`, { changeFrequency: "monthly", priority: 0.6 })),
    ...products.flatMap((p) =>
      localized(`/products/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        ...(p.images[0] ? { images: [p.images[0].url] } : {}),
      })
    ),
  ];
}
