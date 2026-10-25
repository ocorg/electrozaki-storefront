import type { Metadata } from "next";
import {
  BatteryCharging,
  Camera,
  Check,
  Cpu,
  Droplets,
  Monitor,
  Package,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd, returnPolicyJsonLd } from "@/lib/json-ld";
import { LOCALE_META, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { alternates } from "@/lib/i18n/seo";
import { formatMADText } from "@/lib/format";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { BATTERY_GOOD_FROM } from "@/lib/battery";
import type { PhoneOffer } from "@/lib/offers/phone-offers";
import { OFFER_COPY } from "@/lib/offers/copy";
import { STORAGE_SLOT, specRows } from "@/lib/offers/spec-sheet";
import { InspectionReport } from "@/components/storefront/InspectionReport";
import { GuideLinks } from "@/components/storefront/GuideLinks";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { reviewJsonLd, type ReviewSummary } from "@/lib/reviews";
import { ViewBeacon } from "./OfferParts";
import { PhoneOfferExperience } from "./PhoneOfferExperience";
import { OfferFaq, OfferFinal, OfferSteps } from "./OfferSections";
import { clipDescription, pageTitle } from "@/lib/seo-fit";

// A phone model's page, in two modes:
// - "promo" (/offres/<model>): the promo units, for ads and campaigns;
// - "model" (/telephones/<model>): every unit in stock, the page meant to be
//   found in Google ("iPhone 13 d'occasion"). A promo page names it as its
//   canonical, so the two don't compete in search results.
// Units ordered without leaving the page, then why the model, its battery,
// its specs, how ordering works and the questions people ask. Live stock
// and prices (cached, refreshed at once by the ERP).

export type PhonePageMode = "promo" | "model";

const isNewOnly = (offer: PhoneOffer) => offer.grades.length > 0 && offer.grades.every((g) => g === "NEUF");

export function phoneOfferMetadata(offer: PhoneOffer, locale: Locale, mode: PhonePageMode = "promo"): Metadata {
  const c = OFFER_COPY[locale];
  const alt = alternates(locale, `/telephones/${offer.slug}`);
  const from = formatMADText(offer.fromPrice);
  const isNew = isNewOnly(offer);
  const title = mode === "model" ? c.model.metaTitle(offer.name, from, isNew) : c.meta.title(offer.name, from);
  const description = mode === "model" ? c.model.metaDescription(offer.name, from, isNew) : c.meta.description(offer.name, from);
  const cover = offer.images[0];
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
      ...(cover ? { images: [{ url: cover.url, alt: offer.name }] } : {}),
    },
  };
}

export function PhoneOfferPage({
  offer,
  locale,
  t,
  mode = "promo",
  reviews = null,
}: {
  offer: PhoneOffer;
  locale: Locale;
  t: Dictionary;
  mode?: PhonePageMode;
  /** the model's customer reviews */
  reviews?: ReviewSummary | null;
}) {
  const c = OFFER_COPY[locale];
  const isNew = isNewOnly(offer);
  const f = offer.facts;
  const name = offer.name;
  const iphone = f?.batteryHealth ?? false;

  const batteries = offer.units.map((u) => u.batteryHealthPercent).filter((b): b is number => b !== null);
  const minBattery = batteries.length ? Math.min(...batteries) : null;
  const batteryShown = iphone && minBattery !== null;
  const allGood = minBattery !== null && minBattery >= BATTERY_GOOD_FROM;

  const subtitle = [offer.storages.join(" / "), offer.grades.map((g) => t.grades.label[g] ?? g).join(" · ")].filter(Boolean).join(" · ");
  const trust = [...(batteryShown && allGood ? [c.hero.trustBattery.replace("{min}", String(minBattery))] : []), ...c.hero.trust];

  // "Why" cards, from the model's fact sheet.
  const why: { icon: LucideIcon; title: string; text: string }[] = f
    ? [
        { icon: Cpu, title: f.chip, text: c.why.chip },
        { icon: Monitor, title: f.displayTitle, text: c.why.display },
        { icon: Camera, title: f.cameraTitle, text: c.why.camera },
        ...(f.videoHours ? [{ icon: BatteryCharging, title: c.why.batteryTitle(f.videoHours), text: c.why.battery }] : []),
        ...(f.durabilityTitle ? [{ icon: Droplets, title: f.durabilityTitle, text: c.why.durability }] : []),
        ...(f.extra ? [{ icon: Sparkles, title: f.extra, text: c.why.extra }] : []),
      ]
    : [];

  // The model's spec sheet, shown in the order panel's "Fiche de l'appareil"
  // with the chosen phone's storage in its slot.
  const sheet = f ? specRows(f, locale, { storage: STORAGE_SLOT, ram: offer.rams.join(" / ") }) : [];

  const gradesAnswer = offer.grades.map((g) => `${t.grades.label[g] ?? g} : ${t.grades.hint[g] ?? ""}`).join(" ");
  const faq = [
    c.faq.advance,
    c.faq.when,
    ...(iphone ? [c.faq.battery] : []),
    ...(offer.grades.length ? [{ q: c.faq.grades.q, a: gradesAnswer }] : []),
    c.faq.charger,
    c.faq.warranty,
    c.faq.shop,
  ];

  const url = absoluteUrl(localePath(locale, mode === "model" ? `/telephones/${offer.slug}` : `/offres/${offer.slug}`));
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.common.home, item: absoluteUrl(localePath(locale, "/")) },
      { "@type": "ListItem", position: 2, name: t.common.phones, item: absoluteUrl(localePath(locale, "/collections/telephones")) },
      { "@type": "ListItem", position: 3, name, item: absoluteUrl(localePath(locale, `/telephones/${offer.slug}`)) },
    ],
  };
  // Google refuses a product without a picture (see the product page).
  const ldImages = [...new Set([...offer.images.map((i) => i.url), ...offer.units.flatMap((u) => (u.imageUrl ? [u.imageUrl] : []))])];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: { "@type": "Brand", name: offer.brand },
    description:
      mode === "model"
        ? c.model.metaDescription(name, formatMADText(offer.fromPrice), isNew)
        : c.meta.description(name, formatMADText(offer.fromPrice)),
    image: ldImages.length
      ? ldImages.slice(0, 10).map(absoluteUrl)
      : offer.listingSlugs.slice(0, 1).map((slug) => absoluteUrl(`/feeds/product-image/${slug}`)),
    url,
    inLanguage: LOCALE_META[locale].htmlLang,
    offers: {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "MAD",
      lowPrice: String(offer.fromPrice),
      highPrice: String(Math.max(...offer.units.map((u) => u.price))),
      offerCount: offer.units.length,
      itemCondition: isNew ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#store` },
      hasMerchantReturnPolicy: returnPolicyJsonLd(locale),
    },
    ...reviewJsonLd(reviews),
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      {mode === "model" && <JsonLd data={crumbs} />}
      {mode === "promo" && offer.pageId && <ViewBeacon pageId={offer.pageId} />}

      {/* ── Offer and order, first thing on the page ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:pt-10">
        <PhoneOfferExperience
          slug={offer.slug}
          name={name}
          brand={offer.brand}
          hero={{
            eyebrow: mode === "model" ? c.model.eyebrow : c.hero.eyebrow,
            title: mode === "model" ? c.model.title(name, isNew) : name,
            subtitle,
            lead: mode === "model" ? c.model.lead(name, batteryShown) : c.hero.lead(name, batteryShown),
            priceLabel: mode === "model" ? c.model.priceLabel : c.hero.priceLabel,
            instead: c.hero.instead,
            cta: c.hero.cta,
            trust,
            batteryTrust: batteryShown && allGood,
          }}
          copy={c.form(name)}
          units={offer.units}
          images={offer.images}
          addons={offer.addons}
          sheets={{ [offer.slug]: sheet }}
          options={{ [offer.slug]: offer.options }}
          kind={mode}
        />
      </div>

      {/* ── Why this model ── */}
      {why.length > 0 && (
        <section aria-labelledby="why" className="on-dark pcb text-white">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
            <Reveal>
              <SectionHeading id="why" tone="dark" eyebrow={c.why.eyebrow(name)} title={c.why.title} intro={c.why.intro(name)} />
            </Reveal>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {why.map((card, i) => (
                <Reveal as="li" key={card.title} delayMs={i * 60}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                      <card.icon size={24} aria-hidden />
                    </span>
                    <h3 dir="ltr" className="font-display mt-5 text-xl font-bold rtl:text-end">{card.title}</h3>
                    <p className="mt-2 leading-relaxed text-neutral-300">{card.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Battery (iPhones measure it) ── */}
      {batteryShown && (
        <section aria-labelledby="battery" className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <SectionHeading id="battery" eyebrow={c.battery.eyebrow} title={c.battery.title} />
              <p className="mt-5 max-w-xl leading-relaxed text-neutral-700">
                {allGood ? c.battery.text.replace("{min}", String(minBattery)) : c.battery.textAny}
              </p>
              <ul className="mt-6 space-y-3">
                {c.battery.points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-neutral-800">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-signal/15 text-signal">
                      <Check size={14} aria-hidden />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            {/* A gauge reads low → high left to right in every language. */}
            <Reveal>
              <div dir="ltr" className="rounded-4xl bg-ink p-8 text-white">
                <div className="flex items-end justify-between">
                  <BatteryCharging size={36} className="text-gold" aria-hidden />
                  <p className="readout text-6xl font-bold">
                    {minBattery}
                    <span className="text-3xl">%+</span>
                  </p>
                </div>
                <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-linear-to-r from-gold via-gold-bright to-signal" style={{ width: `${minBattery}%` }} />
                </div>
                <div className="readout mt-3 flex justify-between text-xs text-neutral-400">
                  <span>0 %</span>
                  <span>{BATTERY_GOOD_FROM} %</span>
                  <span>100 %</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── The technicians' check + what's in the parcel ── */}
      <section aria-label={c.box.title} className="bg-paper-2/60">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-20 sm:py-24">
          <Reveal>
            <InspectionReport t={t} facts={f} brand={offer.brand} isNew={offer.grades.every((g) => g === "NEUF")} />
          </Reveal>
          <Reveal>
            <div className="max-w-xl rounded-3xl bg-white p-6 ring-1 ring-ink/7">
              <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                <Package size={16} aria-hidden /> {c.box.eyebrow}
              </p>
              <p className="font-display mt-2 text-xl font-bold text-ink">{c.box.title}</p>
              <p className="mt-4 flex items-start gap-2 text-neutral-800">
                <Check size={17} aria-hidden className="mt-0.5 flex-none text-signal" /> {c.box.phone(name)}
              </p>
              <p className="mt-4 rounded-2xl bg-gold/10 px-4 py-3 text-sm text-neutral-700">{c.box.note}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {reviews && (
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
          <ReviewsSection summary={reviews} name={name} t={t} locale={locale} />
        </div>
      )}

      <OfferSteps c={c} />
      <OfferFaq c={c} items={faq} />
      {!isNew && (
        <div className="mx-auto max-w-3xl px-4 pb-16">
          <GuideLinks locale={locale} />
        </div>
      )}
      <OfferFinal title={c.final.title(name)} text={c.final.text} cta={c.final.cta} />
    </div>
  );
}
