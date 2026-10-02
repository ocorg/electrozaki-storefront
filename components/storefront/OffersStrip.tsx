import Link from "@/components/i18n/Link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { OfferCard } from "@/components/storefront/OfferCard";
import { LOCALE_META } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n/server";
import { getLiveOffers } from "@/lib/offers/live";

// Home page: the offers on right now, high up the page. Nothing at all when
// there is no live offer.
export async function OffersStrip() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const offers = await getLiveOffers(locale);
  if (!offers.length) return null;
  const intl = LOCALE_META[locale].intl;

  return (
    <section aria-labelledby="offres" className="mx-auto max-w-7xl px-4 pt-16 sm:pt-20">
      <Reveal>
        <SectionHeading
          id="offres"
          eyebrow={t.offers.eyebrow}
          title={t.offers.homeTitle}
          action={
            offers.length > 1 ? (
              <Link href="/offres" className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
                {t.offers.all}
              </Link>
            ) : undefined
          }
        />
      </Reveal>
      <div className="mt-8 grid gap-6">
        {offers.slice(0, 2).map((o) => (
          <OfferCard key={o.slug} offer={o} t={t} intl={intl} />
        ))}
      </div>
    </section>
  );
}
