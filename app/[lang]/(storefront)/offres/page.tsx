import type { Metadata } from "next";
import { Tag } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { OfferCard } from "@/components/storefront/OfferCard";
import { LOCALE_META } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { getLiveOffers } from "@/lib/offers/live";

// Every offer on right now, for visitors who didn't come from a campaign.
// Same 60 s cache as the offer pages; the ERP refreshes it on every change.
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const alt = alternates(locale, "/offres");
  return {
    title: t.offers.metaTitle,
    description: t.offers.metaDescription,
    alternates: alt,
    openGraph: { title: `${t.offers.metaTitle} | Electro Zaki`, description: t.offers.metaDescription, url: alt.canonical },
  };
}

export default async function OffersPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const offers = await getLiveOffers(locale);
  const intl = LOCALE_META[locale].intl;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:pt-8">
      <Breadcrumbs
        items={[
          { name: t.common.home, path: "/" },
          { name: t.offers.nav, path: "/offres" },
        ]}
        className="mb-6"
      />
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{t.offers.eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold text-ink sm:text-5xl">{t.offers.title}</h1>
      <p className="mt-3 max-w-2xl text-lg text-neutral-600">{t.offers.intro}</p>

      {offers.length ? (
        <div className="mt-10 grid gap-6">
          {offers.map((o, i) => (
            <OfferCard key={o.slug} offer={o} t={t} intl={intl} priority={i === 0} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-4xl bg-white px-6 py-16 text-center ring-1 ring-ink/7">
          <span className="flex h-16 w-16 items-center justify-center rounded-[30%] bg-paper">
            <Tag size={28} className="text-gold-deep" aria-hidden />
          </span>
          <h2 className="font-display mt-5 text-2xl font-bold text-ink">{t.offers.emptyTitle}</h2>
          <p className="mt-2 max-w-md text-neutral-600">{t.offers.emptyText}</p>
          <LinkButton href="/collections/telephones" variant="accent" className="mt-6">
            {t.offers.emptyCta}
          </LinkButton>
        </div>
      )}
    </div>
  );
}
