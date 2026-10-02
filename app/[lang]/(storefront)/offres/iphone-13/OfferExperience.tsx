"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowDown,
  BatteryCharging,
  Cable,
  Check,
  CheckCircle2,
  Gift,
  Headphones,
  Loader2,
  Magnet,
  MessageCircle,
  Phone,
  Plug,
  Plus,
  ShieldCheck,
  Smartphone,
  Sticker,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { categoryName, colorName } from "@/lib/i18n/labels";
import { ProductVisual } from "@/components/storefront/ProductVisual";
import { swatch } from "@/lib/colors";
import { DeliveryPicker } from "@/components/cart/DeliveryPicker";
import { Button } from "@/components/ui/Button";
import { findCity } from "@/lib/delivery";
import { formatMAD } from "@/lib/format";
import { translateError } from "@/lib/i18n/labels";
import { whatsappLink } from "@/lib/site";
import type { OfferAccessory, OfferUnit } from "@/lib/offers/iphone13";
import type { OfferCopy } from "@/lib/offers/iphone13-copy";
import { track } from "@/components/analytics/track";
import { submitIphone13Order } from "./actions";

const ADVANCE = 300;

// Accessories come from the ERP: their icon follows their aisle.
const AISLE_ICONS: Record<string, LucideIcon> = {
  pochettes: Smartphone,
  incassables: ShieldCheck,
  chargeurs: Zap,
  "tete-de-chargeur": Plug,
  cables: Cable,
  "sticky-pad": Sticker,
  "support-magnetique": Magnet,
  ecouteurs: Headphones,
  airpods: Headphones,
  casque: Headphones,
  powerbank: BatteryCharging,
};
const TRUST_ICONS: LucideIcon[] = [BatteryCharging, Wrench, ShieldCheck, Truck];

/** "{rest}" → value. */
function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
}

const inputClass =
  "min-h-12 w-full rounded-2xl border border-ink/15 bg-white px-4 text-[15px] focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

type Props = {
  hero: OfferCopy["hero"];
  copy: OfferCopy["form"];
  units: OfferUnit[];
  images: { url: string; altText: string | null }[];
  included: OfferAccessory[];
  addons: OfferAccessory[];
};

export function OfferExperience({ hero, copy, units, images, included, addons }: Props) {
  const t = useT();
  const formRef = useRef<HTMLDivElement>(null);

  // The colour is the only choice. Units arrive best first (the page sorts
  // them), so the order reserves the best phone of the chosen colour; other
  // details about the device are given on the confirmation call.
  const ranked = units;
  const colors = useMemo(() => [...new Set(ranked.map((u) => u.color ?? ""))], [ranked]);
  const [color, setColor] = useState(colors[0] ?? "");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [city, setCity] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reference: string; whatsappUrl: string; phone: string } | null>(null);
  const [imageIndex, setImageIndex] = useState<number | null>(null);

  // Labels: the product's catalogue name (as in the shop, the cart and the
  // ERP order), with what it is underneath. Badges keep the plain words.
  const label = (a: OfferAccessory) => a.name;
  const plain = (a: OfferAccessory) => copy.items[a.key]?.title ?? a.name;
  const hint = (a: OfferAccessory) => {
    const known = copy.items[a.key];
    const what = known ? [known.title, known.hint].filter(Boolean).join(" · ") : categoryName(t, a.categorySlug, "");
    return what && what !== a.name ? what : undefined;
  };

  const unit = ranked.find((u) => (u.color ?? "") === color);
  const unitId = unit?.id;
  const fee = findCity(city)?.fee ?? 0;
  const addonsTotal = addons.filter((a) => picked.has(a.key)).reduce((s, a) => s + a.price, 0);
  const total = (unit?.price ?? 0) + addonsTotal + fee;
  const saving = unit && unit.normalPrice > unit.price ? unit.normalPrice - unit.price : 0;

  // The chosen unit's photo, unless the customer is browsing the gallery.
  const gallery = images.length ? images : unit?.imageUrl ? [{ url: unit.imageUrl, altText: null }] : [];
  const shown =
    imageIndex !== null && gallery[imageIndex]
      ? gallery[imageIndex]
      : unit?.imageUrl
        ? { url: unit.imageUrl, altText: null }
        : (gallery[0] ?? null);

  function toggle(key: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!unitId || !city) return;
    setBusy(true);
    setError(null);
    try {
      const r = await submitIphone13Order({
        unitId,
        addons: [...picked],
        customerName: name,
        customerPhone: phone,
        deliveryCity: city,
      });
      if (r.ok) {
        // Counted in the ERP's sales funnel like an add to cart (this page has no cart).
        if (unit) track({ t: "add_to_cart", pid: unit.productId, v: total });
        setDone({ reference: r.reference, whatsappUrl: r.whatsappUrl, phone });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else setError(translateError(t, r.error));
    } catch {
      setError(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
      {/* ── Gallery ── */}
      <div className="md:sticky md:top-28 md:self-start">
        <div className="relative aspect-square overflow-hidden rounded-4xl border border-ink/7 bg-white shadow-[0_30px_60px_-40px_rgb(17_16_19/0.5)]">
          <ProductVisual image={shown} name="iPhone 13" brand="Apple" isPhone priority size="large" sizes="(min-width: 768px) 50vw, 100vw" />
          <ul className="absolute inset-s-4 top-4 z-3 flex flex-col gap-2">
            {included.map((g) => (
              <li key={g.key} className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-gold">
                <Gift size={14} aria-hidden /> {fill(hero.giftBadge, { item: plain(g) })}
              </li>
            ))}
          </ul>
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label={t.pdp.photos}>
            {gallery.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={t.pdp.photo(i + 1)}
                aria-pressed={shown?.url === img.url}
                className={`relative h-18 w-18 flex-none overflow-hidden rounded-2xl border-2 bg-white transition-colors ${
                  shown?.url === img.url ? "border-ink" : "border-transparent hover:border-ink/20"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="72px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Offer + order ── */}
      <div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">{hero.eyebrow}</p>
        <h1 className="font-display mt-2 text-5xl font-extrabold leading-none text-ink sm:text-6xl">{hero.title}</h1>
        <p className="mt-2 text-lg font-semibold text-neutral-700">{hero.subtitle}</p>

        {unit && (
          <div className="mt-5">
            <p className="text-sm font-medium text-neutral-600">{hero.priceLabel}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <p dir="ltr" className="readout text-5xl font-bold leading-none text-ink">
                {formatMAD(unit.price)}
              </p>
              {saving > 0 && (
                <>
                  <p className="text-base text-neutral-500">
                    {hero.instead} <span className="readout line-through">{formatMAD(unit.normalPrice)}</span>
                  </p>
                  <span dir="ltr" className="rounded-full bg-red-600 px-2.5 py-1 text-sm font-bold text-white">-{formatMAD(saving)}</span>
                </>
              )}
            </div>
          </div>
        )}

        <p className="mt-5 leading-relaxed text-neutral-700">{hero.lead}</p>

        <ul className="mt-5 grid grid-cols-2 gap-2 text-sm text-neutral-800">
          {hero.trust.map((item, i) => {
            const Icon = TRUST_ICONS[i] ?? Check;
            return (
              <li key={item} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-ink/6">
                <Icon size={17} aria-hidden className="flex-none text-gold-deep" />
                {item}
              </li>
            );
          })}
        </ul>

        {!done && units.length > 0 && (
          <a
            href="#commander"
            className="mt-5 flex min-h-13 items-center justify-center gap-2 rounded-full bg-gold px-6 text-base font-bold text-ink transition-[filter] hover:brightness-105 md:hidden"
          >
            {hero.cta} <ArrowDown size={18} aria-hidden />
          </a>
        )}

        <div id="commander" ref={formRef} className="scroll-mt-28">
          {done ? (
            <div className="mt-8 rounded-4xl bg-ink p-6 text-white sm:p-8" role="status">
              <CheckCircle2 size={36} className="text-gold" aria-hidden />
              <h2 className="font-display mt-4 text-3xl font-bold">{copy.successTitle}</h2>
              <p dir="ltr" className="mt-2 font-mono text-sm text-neutral-300 rtl:text-end">
                {fill(copy.successRef, { ref: done.reference })}
              </p>
              <p className="mt-4 leading-relaxed text-neutral-200">
                {fill(copy.successText, { phone: done.phone })}
              </p>
              <ol className="mt-6 space-y-3">
                {copy.successSteps.map((s, i) => (
                  <li key={s} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gold text-sm font-bold text-ink">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <a
                href={done.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-semibold text-ink"
              >
                <MessageCircle size={18} aria-hidden /> {copy.whatsapp}
              </a>
            </div>
          ) : units.length === 0 ? (
            <div className="mt-8 rounded-4xl bg-ink/5 p-6">
              <p className="font-display text-2xl font-bold text-ink">{copy.soldOutTitle}</p>
              <p className="mt-2 text-neutral-700">{copy.soldOutText}</p>
              <a
                href={whatsappLink(copy.soldOutTitle)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-full bg-whatsapp px-6 font-semibold text-ink"
              >
                <MessageCircle size={18} aria-hidden /> {copy.whatsapp}
              </a>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 rounded-4xl border border-ink/8 bg-white p-4 shadow-[0_30px_60px_-45px_rgb(17_16_19/0.45)] sm:p-6">
              <h2 className="font-display text-2xl font-bold text-ink">{copy.title}</h2>

              <div className="mt-5 space-y-5">
                <fieldset>
                  <legend className="mb-3 text-sm font-semibold text-neutral-700">{t.unitPicker.color}</legend>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c || "none"}
                        type="button"
                        aria-pressed={color === c}
                        onClick={() => {
                          setColor(c);
                          setImageIndex(null);
                        }}
                        className={`inline-flex min-h-12 items-center gap-2.5 rounded-full border px-4 text-sm font-semibold transition-colors ${
                          color === c ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:border-ink/40"
                        }`}
                      >
                        <span aria-hidden className="h-5 w-5 rounded-full border border-ink/15" style={{ background: swatch(c || null) }} />
                        {c ? colorName(t, c) : t.unitPicker.other}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Free with the phone */}
              {included.length > 0 && (
                <section className="mt-7" aria-labelledby="offer-included">
                  <h3 id="offer-included" className="text-sm font-semibold text-neutral-700">{copy.included}</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {included.map((item) => {
                      const Icon = AISLE_ICONS[item.categorySlug] ?? Gift;
                      return (
                        <li key={item.key} className="flex items-center gap-3 rounded-2xl bg-gold/10 px-4 py-3 ring-1 ring-gold/40">
                          <Icon size={20} aria-hidden className="flex-none text-gold-deep" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-ink">{label(item)}</span>
                            {hint(item) && <span className="block text-xs text-neutral-600">{hint(item)}</span>}
                          </span>
                          <span className="text-sm text-neutral-500 line-through">{formatMAD(item.price)}</span>
                          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-bold text-gold">{copy.free}</span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Suggested add-ons */}
              {addons.length > 0 && (
                <section className="mt-7" aria-labelledby="offer-addons">
                  <h3 id="offer-addons" className="text-sm font-semibold text-neutral-700">{copy.addons}</h3>
                  <p className="mt-1 text-xs text-neutral-500">{copy.addonsHint}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {addons.map((a) => {
                      const on = picked.has(a.key);
                      const Icon = AISLE_ICONS[a.categorySlug] ?? Plus;
                      const sub = hint(a);
                      return (
                        <li key={a.key}>
                          <button
                            type="button"
                            onClick={() => toggle(a.key)}
                            aria-pressed={on}
                            className={`flex h-full w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start transition-colors ${
                              on ? "border-gold-deep bg-gold/8 ring-2 ring-gold/40" : "border-ink/12 bg-white hover:border-ink/30"
                            }`}
                          >
                            <Icon size={20} aria-hidden className="flex-none text-gold-deep" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-ink">{label(a)}</span>
                              {sub && <span className="block text-xs text-neutral-500">{sub}</span>}
                            </span>
                            <span className="flex flex-col items-end gap-1">
                              <span dir="ltr" className="readout text-sm font-bold text-ink">+{formatMAD(a.price)}</span>
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  on ? "bg-ink text-white" : "bg-ink/6 text-ink"
                                }`}
                              >
                                {on ? <Check size={12} aria-hidden /> : <Plus size={12} aria-hidden />}
                                {on ? copy.added : copy.add}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {/* Delivery: the town sets the fee and the date */}
              <section className="mt-7">
                <h3 className="mb-3 text-sm font-semibold text-neutral-700">{copy.delivery}</h3>
                <DeliveryPicker value={city} onChangeAction={setCity} />
              </section>

              {/* Contact */}
              <section className="mt-7 space-y-3" aria-labelledby="offer-contact">
                <h3 id="offer-contact" className="text-sm font-semibold text-neutral-700">{copy.contact}</h3>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={copy.fullName}
                  aria-label={copy.fullName}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  className={inputClass}
                />
                <div className="relative">
                  <Phone size={17} aria-hidden className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={copy.phone}
                    aria-label={copy.phone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    className={`${inputClass} ps-11 rtl:text-end`}
                  />
                </div>
              </section>

              {/* Summary */}
              <section className="mt-7 rounded-3xl bg-paper-2 p-4 sm:p-5" aria-labelledby="offer-summary">
                <h3 id="offer-summary" className="text-sm font-semibold text-neutral-700">{copy.summary}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-700">{copy.phoneLine}</dt>
                    <dd className="readout font-semibold">{unit ? formatMAD(unit.price) : "-"}</dd>
                  </div>
                  {included.length > 0 && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-700">{included.map(label).join(" + ")}</dt>
                      <dd className="font-semibold text-green-700">{copy.free}</dd>
                    </div>
                  )}
                  {addons
                    .filter((a) => picked.has(a.key))
                    .map((a) => (
                      <div key={a.key} className="flex justify-between gap-4">
                        <dt className="text-neutral-700">{label(a)}</dt>
                        <dd className="readout font-semibold">{formatMAD(a.price)}</dd>
                      </div>
                    ))}
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-700">
                      {copy.delivery}
                      {city ? ` (${city})` : ""}
                    </dt>
                    <dd className={city ? "readout font-semibold" : "text-neutral-500"}>{city ? formatMAD(fee) : copy.deliveryPending}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-ink/10 pt-3 text-lg">
                    <dt className="font-bold text-ink">{copy.total}</dt>
                    <dd className="readout font-bold text-ink">{formatMAD(total)}</dd>
                  </div>
                </dl>
              </section>

              {/* The 300 DH advance */}
              <div className="mt-4 rounded-3xl border border-gold/50 bg-gold/8 p-4 sm:p-5">
                <p className="font-semibold text-ink">{copy.advanceTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                  {fill(copy.advanceText, { rest: formatMAD(Math.max(0, total - ADVANCE)) })}
                </p>
                <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-neutral-700">
                  <Phone size={16} aria-hidden className="mt-0.5 flex-none text-gold-deep" />
                  {copy.callNote}
                </p>
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" variant="accent" size="lg" disabled={busy || !unitId || !city} className="mt-5 w-full">
                {busy ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden /> {copy.sending}
                  </>
                ) : (
                  <>
                    {copy.submit} {unit && city ? <span className="readout">· {formatMAD(total)}</span> : null}
                  </>
                )}
              </Button>
              {(!unitId || !city) && (
                <p className="mt-2 text-center text-xs font-medium text-neutral-600">{!unitId ? copy.needUnit : copy.needCity}</p>
              )}
              <p className="mt-3 text-center text-xs text-neutral-500">{copy.consent}</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
