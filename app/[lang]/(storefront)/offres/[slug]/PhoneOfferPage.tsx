import type { Metadata } from "next";
import {
  ArrowDown,
  BatteryCharging,
  Camera,
  Check,
  ChevronDown,
  Cpu,
  Droplets,
  Monitor,
  Package,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/lib/json-ld";
import { LOCALE_META, localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { alternates } from "@/lib/i18n/seo";
import { formatMAD } from "@/lib/format";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { BATTERY_GOOD_FROM } from "@/lib/battery";
import type { PhoneOffer } from "@/lib/offers/phone-offers";
import { OFFER_COPY } from "@/lib/offers/copy";
import { ViewBeacon } from "./OfferParts";
import { PhoneOfferExperience } from "./PhoneOfferExperience";

// A phone model's promo page (/offres/<model>): the promo units, ordered
// without leaving the page, then why the model, its battery, its specs,
// how ordering works and the questions people ask. Live stock and prices
// (60 s cache, refreshed at once by the ERP).

export function phoneOfferMetadata(offer: PhoneOffer, locale: Locale): Metadata {
  const c = OFFER_COPY[locale];
  const alt = alternates(locale, `/offres/${offer.slug}`);
  const title = c.meta.title(offer.name, formatMAD(offer.fromPrice));
  const description = c.meta.description(offer.name, formatMAD(offer.fromPrice));
  const cover = offer.images[0];
  return {
    title,
    description,
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

export function PhoneOfferPage({ offer, locale, t }: { offer: PhoneOffer; locale: Locale; t: Dictionary }) {
  const c = OFFER_COPY[locale];
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
        { icon: Droplets, title: f.durabilityTitle, text: c.why.durability },
        ...(f.extra ? [{ icon: Sparkles, title: f.extra, text: c.why.extra }] : []),
      ]
    : [];

  // Specs: the sheet's rows, with the storages and memory of the units on promo.
  const L = c.specs.labels;
  const specs: [string, string][] = f
    ? ([
        [L.display, f.specs.display],
        [L.chip, f.specs.chip],
        [L.storage, offer.storages.join(" / ")],
        ...(offer.rams.length ? [[L.ram, offer.rams.join(" / ")] as [string, string]] : []),
        [L.rearCameras, f.specs.rearCameras],
        [L.frontCamera, f.specs.frontCamera],
        [L.battery, f.specs.battery],
        [L.charging, f.specs.charging],
        [L.durability, f.specs.durability],
        [L.network, f.specs.network],
        ...(f.specs.sim ? [[L.sim, f.specs.sim] as [string, string]] : []),
        [L.size, f.specs.size],
      ] as [string, string][]).filter(([, v]) => v)
    : [];

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

  const url = absoluteUrl(localePath(locale, `/offres/${offer.slug}`));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: { "@type": "Brand", name: offer.brand },
    description: c.meta.description(name, formatMAD(offer.fromPrice)),
    image: offer.images.map((i) => absoluteUrl(i.url)),
    url,
    inLanguage: LOCALE_META[locale].htmlLang,
    offers: {
      "@type": "AggregateOffer",
      url,
      priceCurrency: "MAD",
      lowPrice: String(offer.fromPrice),
      highPrice: String(Math.max(...offer.units.map((u) => u.price))),
      offerCount: offer.units.length,
      itemCondition: "https://schema.org/UsedCondition",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      {offer.pageId && <ViewBeacon pageId={offer.pageId} />}

      {/* ── Offer and order, first thing on the page ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:pt-10">
        <PhoneOfferExperience
          slug={offer.slug}
          name={name}
          brand={offer.brand}
          hero={{
            eyebrow: c.hero.eyebrow,
            title: name,
            subtitle,
            lead: c.hero.lead(name, batteryShown),
            priceLabel: c.hero.priceLabel,
            instead: c.hero.instead,
            cta: c.hero.cta,
            trust,
            batteryTrust: batteryShown && allGood,
          }}
          copy={c.form(name)}
          units={offer.units}
          images={offer.images}
          addons={offer.addons}
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

      {/* ── Specs + what's in the parcel ── */}
      <section aria-labelledby="specs" className="bg-paper-2/60">
        <div className={`mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:py-24 ${specs.length ? "lg:grid-cols-[1fr_1.4fr]" : ""}`}>
          <Reveal>
            <SectionHeading id="specs" eyebrow={c.specs.eyebrow} title={c.specs.title(name)} />
            <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-ink/7">
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
          {specs.length > 0 && (
            <Reveal>
              <dl className="divide-y divide-ink/7 rounded-3xl bg-white px-5 ring-1 ring-ink/7 sm:px-6">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                    <dt className="text-sm font-semibold text-neutral-600">{k}</dt>
                    <dd dir="ltr" className="text-[15px] text-ink rtl:text-end">{v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Checks + how ordering works ── */}
      <section aria-labelledby="steps" className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <Reveal>
          <SectionHeading id="steps" eyebrow={c.steps.eyebrow} title={c.steps.title} />
        </Reveal>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.items.map((s, i) => (
            <Reveal as="li" key={s.title} delayMs={i * 70}>
              <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-ink/7">
                <p className="readout text-3xl font-bold text-gold-deep">{String(i + 1).padStart(2, "0")}</p>
                <p className="font-display mt-3 text-lg font-bold text-ink">{s.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <Reveal>
          <div className="mt-12 rounded-4xl border border-ink/8 bg-white p-6 sm:p-8">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">{c.checks.eyebrow}</p>
            <p className="font-display mt-2 text-2xl font-bold text-ink">{c.checks.title}</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {c.checks.items(iphone || offer.brand.toLowerCase() === "apple").map((item) => (
                <li key={item} className="flex items-center gap-2 text-neutral-800">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-signal/15 text-signal">
                    <Check size={14} aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 pb-20">
        <Reveal>
          <SectionHeading id="faq" eyebrow={c.faq.eyebrow} title={c.faq.title} />
        </Reveal>
        <div className="mt-8 divide-y divide-ink/7 overflow-hidden rounded-3xl border border-ink/7 bg-white">
          {faq.map((item) => (
            <details key={item.q} className="group open:bg-paper/60">
              <summary className="flex min-h-14 cursor-pointer list-none items-center px-5 py-4 font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex w-full items-center justify-between gap-4">
                  {item.q}
                  <ChevronDown size={18} aria-hidden className="flex-none text-neutral-500 transition-transform duration-300 group-open:rotate-180" />
                </span>
              </summary>
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-neutral-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Last call ── */}
      <section className="px-4 pb-20">
        <div className="on-dark mx-auto flex max-w-5xl flex-col items-center rounded-4xl bg-ink px-6 py-14 text-center text-white">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{c.final.title(name)}</h2>
          <p className="mt-3 max-w-md text-neutral-300">{c.final.text}</p>
          <a
            href="#commander"
            className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-gold px-8 text-base font-bold text-ink transition-[filter] hover:brightness-105"
          >
            {c.final.cta} <ArrowDown size={18} aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
