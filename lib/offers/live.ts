import { cache } from "react";
import { prisma } from "@/lib/db/client";
import { landingProductIds, landingStatus } from "@/lib/db/landing";
import { formatMAD } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { OFFER_SLUG, getIphone13Offer } from "./iphone13";
import { OFFER_COPY, giftList } from "./iphone13-copy";

// Every offer live right now, for the parts of the site that point to them:
// the header ("Offres" + the top bar), /offres, the home page, the sitemap.
// An offer is listed only while its ERP promo page is on, within its dates,
// and has something to sell, so the "Offres" link never leads nowhere.

export type LiveOffer = {
  slug: string;
  /** unprefixed path, e.g. /offres/iphone-13 */
  href: string;
  title: string;
  teaser: string | null;
  image: string | null;
  /** "from" price and the normal one it replaces (iPhone 13 offer) */
  price: number | null;
  normalPrice: number | null;
  /** "-20 %" / "-100 DH" (ERP promo pages) */
  discount: string | null;
  endsAt: string | null;
  /** one line for the top bar */
  bar: string;
};

function discountLabel(type: string | null, value: { toString(): string } | null): string | null {
  const v = value === null ? 0 : Number(value.toString());
  if (!type || !(v > 0)) return null;
  return type === "PERCENTAGE" ? `-${v} %` : `-${formatMAD(v)}`;
}

async function loadLiveOffers(locale: Locale): Promise<LiveOffer[]> {
  const t = DICTIONARIES[locale];
  const pages = await prisma.landingPage.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      bannerUrl: true,
      active: true,
      startsAt: true,
      endsAt: true,
      discountType: true,
      discountValue: true,
    },
  });

  const offers: LiveOffer[] = [];
  for (const page of pages.filter((p) => landingStatus(p) === "live")) {
    const endsAt = page.endsAt?.toISOString() ?? null;

    if (page.slug === OFFER_SLUG) {
      const offer = await getIphone13Offer();
      if (offer.status !== "live" || !offer.units.length || offer.fromPrice === null) continue;
      const c = OFFER_COPY[locale];
      const gifts = giftList(c, offer.included, locale);
      offers.push({
        slug: page.slug,
        href: `/offres/${page.slug}`,
        title: c.card.title,
        teaser: c.card.teaser(gifts),
        image: offer.images[0]?.url ?? null,
        price: offer.fromPrice,
        normalPrice: offer.normalFrom,
        discount: null,
        endsAt,
        bar: c.card.bar(formatMAD(offer.fromPrice), gifts),
      });
      continue;
    }

    // ERP promo pages (/offres/[slug]): listed while they have products in stock.
    const ids = await landingProductIds(page.id);
    if (!ids.length) continue;
    const discount = discountLabel(page.discountType, page.discountValue);
    const cover = page.bannerUrl
      ? null
      : await prisma.productImage.findFirst({ where: { productId: { in: ids } }, orderBy: { sortOrder: "asc" }, select: { url: true } });
    offers.push({
      slug: page.slug,
      href: `/offres/${page.slug}`,
      title: page.title,
      teaser: page.subtitle,
      image: page.bannerUrl ?? cover?.url ?? null,
      price: null,
      normalPrice: null,
      discount,
      endsAt,
      bar: discount ? `${page.title} : ${t.offers.discount(discount)}` : page.title,
    });
  }
  return offers;
}

/** Live offers in this language (read once per page render). */
export const getLiveOffers = cache(loadLiveOffers);
