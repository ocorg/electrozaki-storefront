import type { Metadata } from "next";
import Image from "next/image";
import { ArrowRight, ImageOff } from "lucide-react";
import Link from "@/components/i18n/Link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InspectionReport } from "@/components/storefront/InspectionReport";
import { JsonLd } from "@/lib/json-ld";
import { LOCALE_META, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { alternates } from "@/lib/i18n/seo";
import { formatMAD, formatMADText } from "@/lib/format";
import { absoluteUrl } from "@/lib/site";
import { BATTERY_GOOD_FROM } from "@/lib/battery";
import type { BrandOffer } from "@/lib/offers/phone-offers";
import { OFFER_COPY } from "@/lib/offers/copy";
import { STORAGE_SLOT, specRows } from "@/lib/offers/spec-sheet";
import { ViewBeacon } from "./OfferParts";
import { PhoneOfferExperience } from "./PhoneOfferExperience";
import { OfferFaq, OfferFinal, OfferSteps } from "./OfferSections";
import { clipDescription, pageTitle } from "@/lib/seo-fit";

// A brand's promo page (/offres/iphone, /offres/samsung): every unit on
// promo of every model of the brand, ordered without leaving the page, for
// a campaign that advertises one link. Below, a card per model leads to
// its own page (specs, battery, why that model).

export function brandOfferMetadata(brand: BrandOffer, locale: Locale): Metadata {
  const c = OFFER_COPY[locale];
  const alt = alternates(locale, `/offres/${brand.slug}`);
  const title = c.brand.metaTitle(brand.name, formatMADText(brand.fromPrice));
  const description = c.brand.metaDescription(brand.name, formatMADText(brand.fromPrice), brand.models.length);
  const cover = brand.images[0];
  return {
    title: pageTitle(title),
    description: clipDescription(description),
    alternates: alt,
    openGraph: {
      type: "website",
      title: `${title} | Electro Zaki`,
      description,
      url: alt.canonical,
      locale: LOCALE_META[locale].ogLocale,
      ...(cover ? { images: [{ url: cover.url, alt: brand.name }] } : {}),
    },
  };
}

export function BrandOfferPage({ brand, locale, t }: { brand: BrandOffer; locale: Locale; t: Dictionary }) {
  const c = OFFER_COPY[locale];
  const b = c.brand;
  const iphone = brand.models.some((m) => m.facts?.batteryHealth);
  const batteries = brand.units.map((u) => u.batteryHealthPercent).filter((x): x is number => x !== null);
  const minBattery = batteries.length ? Math.min(...batteries) : null;
  const allGood = iphone && minBattery !== null && minBattery >= BATTERY_GOOD_FROM;
  const trust = [...(allGood ? [c.hero.trustBattery.replace("{min}", String(minBattery))] : []), ...c.hero.trust];

  // Each model's spec sheet, for the "Fiche de l'appareil" of the phone picked.
  const sheets = Object.fromEntries(
    brand.models.map((m) => [m.slug, m.facts ? specRows(m.facts, locale, { storage: STORAGE_SLOT, ram: m.rams.join(" / ") }) : []])
  );

  const gradesAnswer = brand.grades.map((g) => `${t.grades.label[g] ?? g} : ${t.grades.hint[g] ?? ""}`).join(" ");
  const faq = [
    c.faq.advance,
    c.faq.when,
    ...(iphone ? [c.faq.battery] : []),
    ...(brand.grades.length ? [{ q: c.faq.grades.q, a: gradesAnswer }] : []),
    c.faq.charger,
    c.faq.warranty,
    c.faq.shop,
  ];

  const url = absoluteUrl(localePath(locale, `/offres/${brand.slug}`));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: b.title(brand.name),
    url,
    itemListElement: brand.models.map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(localePath(locale, `/offres/${m.slug}`)),
      name: m.name,
    })),
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      {brand.pageId && <ViewBeacon pageId={brand.pageId} />}

      {/* ── Every promo phone of the brand, and the order form ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:pt-10">
        <PhoneOfferExperience
          slug={brand.slug}
          name={brand.name}
          brand={brand.brand}
          hero={{
            eyebrow: b.eyebrow,
            title: b.title(brand.name),
            subtitle: brand.models.map((m) => m.name).join(" · "),
            lead: b.lead(brand.name, brand.models.length),
            priceLabel: c.hero.priceLabel,
            instead: c.hero.instead,
            cta: c.hero.cta,
            trust,
            batteryTrust: allGood,
          }}
          copy={c.form(brand.name)}
          units={brand.units}
          images={brand.images}
          addons={[]}
          sheets={sheets}
          models={brand.models.map((m) => ({ slug: m.slug, name: m.name }))}
          options={Object.fromEntries(brand.models.map((m) => [m.slug, m.options]))}
        />
      </div>

      {/* ── The models: each has its own page ── */}
      <section aria-labelledby="models" className="bg-paper-2/60">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
          <Reveal>
            <SectionHeading id="models" eyebrow={b.title(brand.name)} title={b.modelsTitle} intro={b.modelsIntro} />
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brand.models.map((m) => {
              const cover = m.images[0];
              return (
                <Reveal as="li" key={m.slug}>
                  <Link
                    href={`/offres/${m.slug}`}
                    className="group flex h-full gap-4 rounded-3xl bg-white p-4 ring-1 ring-ink/7 transition-shadow hover:ring-ink/20"
                  >
                    <span className="relative flex h-24 w-24 flex-none items-center justify-center overflow-hidden rounded-2xl bg-paper">
                      {cover ? (
                        <Image src={cover.url} alt={m.name} fill sizes="96px" className="object-contain p-1.5" />
                      ) : (
                        <ImageOff size={20} className="text-neutral-300" aria-hidden />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-display text-lg font-bold text-ink">{m.name}</span>
                      <span className="text-sm text-neutral-600">{b.phones(m.units.length)}</span>
                      <span className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-2">
                        <span className="text-xs text-neutral-500">{b.from}</span>
                        <span dir="ltr" className="readout text-lg font-bold text-ink">{formatMAD(m.fromPrice)}</span>
                        {m.bestSaving > 0 && (
                          <span dir="ltr" className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                            {b.upTo(formatMAD(m.bestSaving))}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ink underline-offset-4 group-hover:underline">
                        {b.seeModel} <ArrowRight size={15} aria-hidden className="rtl:rotate-180" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── The technicians' check ── */}
      <section aria-label={t.inspection.eyebrow} className="mx-auto max-w-7xl px-4 pt-20 sm:pt-24">
        <Reveal>
          <InspectionReport t={t} facts={brand.models[0].facts} brand={brand.brand} isNew={brand.grades.every((g) => g === "NEUF")} />
        </Reveal>
      </section>

      <OfferSteps c={c} />
      <OfferFaq c={c} items={faq} />
      <OfferFinal title={b.finalTitle(brand.name)} text={c.final.text} cta={c.final.cta} />
    </div>
  );
}
