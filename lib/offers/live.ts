import { cache } from "react";
import { prisma } from "@/lib/db/client";
import { landingProductIds, landingStatus } from "@/lib/db/landing";
import { formatMAD } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";
import { getBrandOffers, getPhoneOffers } from "./phone-offers";
import { OFFER_COPY } from "./copy";

// Every offer live right now, for the parts of the site that point to them:
// the header ("Offres" + the top bar), /offres, the home page, the sitemap.
// Phone models are listed while they have promo units in stock; ERP promo
// pages while they are on, within their dates, and have something to sell,
// so the "Offres" link never leads nowhere.

export type LiveOffer = {
  slug: string;
  /** unprefixed path, e.g. /offres/iphone-13 */
  href: string;
  title: string;
  teaser: string | null;
  image: string | null;
  /** "from" price and the normal one it replaces (phone offers) */
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

  // Brand pages first (/offres/iphone…: every model of the brand), then the
  // phone models on promo in the ERP (/offres/iphone-14…): one each.
  const c = OFFER_COPY[locale];
  const [brandOffers, phoneOffers] = await Promise.all([getBrandOffers(), getPhoneOffers()]);
  const offers: LiveOffer[] = brandOffers.map((b) => ({
    slug: b.slug,
    href: `/offres/${b.slug}`,
    title: c.brand.cardTitle(b.name),
    teaser: c.brand.cardTeaser(b.models.length),
    image: b.images[0]?.url ?? null,
    price: b.fromPrice,
    normalPrice: b.normalFrom,
    discount: null,
    endsAt: b.endsAt?.toISOString() ?? null,
    bar: c.card.bar(b.name, formatMAD(b.fromPrice)),
  }));
  offers.push(...phoneOffers.map((o) => ({
    slug: o.slug,
    href: `/offres/${o.slug}`,
    title: c.card.title(o.name),
    teaser: c.card.teaser(formatMAD(o.bestSaving)),
    image: o.images[0]?.url ?? null,
    price: o.fromPrice,
    normalPrice: o.normalFrom,
    discount: null,
    endsAt: o.endsAt?.toISOString() ?? null,
    bar: c.card.bar(o.name, formatMAD(o.fromPrice)),
  })));
  const phoneSlugs = new Set([...brandOffers.map((b) => b.slug), ...phoneOffers.map((o) => o.slug)]);

  for (const page of pages.filter((p) => landingStatus(p) === "live" && !phoneSlugs.has(p.slug))) {
    const endsAt = page.endsAt?.toISOString() ?? null;

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
