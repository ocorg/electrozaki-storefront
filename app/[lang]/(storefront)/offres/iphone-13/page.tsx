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
  ScanFace,
  type LucideIcon,
} from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { JsonLd } from "@/lib/json-ld";
import { LOCALE_META, localePath } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { getIphone13Offer, OFFER_SLUG } from "@/lib/offers/iphone13";
import { OFFER_COPY } from "@/lib/offers/iphone13-copy";
import { ViewBeacon } from "../[slug]/OfferParts";
import { OfferExperience } from "./OfferExperience";

// The iPhone 13 offer: one page, one phone, ordered without leaving it.
// Live stock and prices (60 s cache, refreshed at once by the ERP); the ERP
// promo page "iphone-13" switches it on and off and sets the offer price.
export const revalidate = 60;

const WHY_ICONS: LucideIcon[] = [Cpu, Camera, Monitor, BatteryCharging, Droplets, ScanFace];
const PATH = `/offres/${OFFER_SLUG}`;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const c = OFFER_COPY[locale];
  const alt = alternates(locale, PATH);
  const offer = await getIphone13Offer();
  const cover = offer.images[0];
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: alt,
    openGraph: {
      type: "website",
      title: `${c.meta.title} | Electro Zaki`,
      description: c.meta.description,
      url: alt.canonical,
      locale: LOCALE_META[locale].ogLocale,
      ...(cover ? { images: [{ url: cover.url, alt: "iPhone 13" }] } : {}),
    },
  };
}

export default async function Iphone13OfferPage() {
  const locale = await getLocale();
  const c = OFFER_COPY[locale];
  const offer = await getIphone13Offer();

  // Switched off in the ERP, or not started / already over.
  if (offer.status !== "live") {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold text-ink">{c.stockOut.title}</h1>
        <p className="mt-4 text-lg text-neutral-600">{c.stockOut.text}</p>
        <LinkButton href="/collections/telephones" variant="accent" className="mt-8">
          {c.stockOut.cta}
        </LinkButton>
      </section>
    );
  }

  const batteries = offer.units.map((u) => u.batteryHealthPercent).filter((b): b is number => b !== null);
  const minBattery = batteries.length ? Math.min(...batteries) : null;
  const min = String(minBattery ?? 80);

  const url = absoluteUrl(localePath(locale, PATH));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "iPhone 13 128GB",
    brand: { "@type": "Brand", name: "Apple" },
    description: c.meta.description,
    image: offer.images.map((i) => absoluteUrl(i.url)),
    url,
    inLanguage: LOCALE_META[locale].htmlLang,
    ...(offer.fromPrice !== null
      ? {
          offers: {
            "@type": "Offer",
            url,
            priceCurrency: "MAD",
            price: String(offer.fromPrice),
            itemCondition: "https://schema.org/UsedCondition",
            availability: offer.units.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@id": `${SITE_URL}/#store` },
          },
        }
      : {}),
  };

  return (
    <div>
      <JsonLd data={jsonLd} />
      {offer.pageId && <ViewBeacon pageId={offer.pageId} />}

      {/* ── Offer and order, first thing on the page ── */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:pt-10">
        <OfferExperience
          hero={c.hero}
          copy={c.form}
          units={offer.units}
          images={offer.images}
          included={offer.included}
          addons={offer.addons}
          minBattery={minBattery}
        />
      </div>

      {/* ── Why the iPhone 13 ── */}
      <section aria-labelledby="why" className="on-dark pcb text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
          <Reveal>
            <SectionHeading id="why" tone="dark" eyebrow={c.why.eyebrow} title={c.why.title} intro={c.why.intro} />
          </Reveal>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.why.cards.map((card, i) => {
              const Icon = WHY_ICONS[i] ?? Check;
              return (
                <Reveal as="li" key={card.title} delayMs={i * 60}>
                  <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                      <Icon size={24} aria-hidden />
                    </span>
                    <h3 className="font-display mt-5 text-xl font-bold">{card.title}</h3>
                    <p className="mt-2 leading-relaxed text-neutral-300">{card.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Battery ── */}
      <section aria-labelledby="battery" className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading id="battery" eyebrow={c.battery.eyebrow} title={c.battery.title} />
            <p className="mt-5 max-w-xl leading-relaxed text-neutral-700">{c.battery.text.replace("{min}", min)}</p>
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
                  {min}
                  <span className="text-3xl">%+</span>
                </p>
              </div>
              <div className="mt-8 h-4 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-linear-to-r from-gold via-gold-bright to-signal" style={{ width: `${min}%` }} />
              </div>
              <div className="readout mt-3 flex justify-between text-xs text-neutral-400">
                <span>0 %</span>
                <span>80 %</span>
                <span>100 %</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Specs ── */}
      <section aria-labelledby="specs" className="bg-paper-2/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <SectionHeading id="specs" eyebrow={c.specs.eyebrow} title={c.specs.title} />
            <div className="mt-8 rounded-3xl bg-white p-6 ring-1 ring-ink/7">
              <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
                <Package size={16} aria-hidden /> {c.box.eyebrow}
              </p>
              <p className="font-display mt-2 text-xl font-bold text-ink">{c.box.title}</p>
              <ul className="mt-4 space-y-2">
                {c.box.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-neutral-800">
                    <Check size={17} aria-hidden className="mt-0.5 flex-none text-signal" /> {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-2xl bg-gold/10 px-4 py-3 text-sm text-neutral-700">{c.box.note}</p>
            </div>
          </Reveal>
          <Reveal>
            <dl className="divide-y divide-ink/7 rounded-3xl bg-white px-5 ring-1 ring-ink/7 sm:px-6">
              {c.specs.rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-sm font-semibold text-neutral-600">{k}</dt>
                  <dd className="text-[15px] text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
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
              {c.checks.items.map((item) => (
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
          {c.faq.items.map((item) => (
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
      {offer.units.length > 0 && (
        <section className="px-4 pb-20">
          <div className="on-dark mx-auto flex max-w-5xl flex-col items-center rounded-4xl bg-ink px-6 py-14 text-center text-white">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">{c.final.title}</h2>
            <p className="mt-3 max-w-md text-neutral-300">{c.final.text}</p>
            <a
              href="#commander"
              className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-gold px-8 text-base font-bold text-ink transition-[filter] hover:brightness-105"
            >
              {c.final.cta} <ArrowDown size={18} aria-hidden />
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
