"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  ArrowDown,
  BatteryCharging,
  AlertCircle,
  Cable,
  Check,
  CheckCircle2,
  Headphones,
  Magnet,
  MessageCircle,
  Phone,
  Plug,
  Plus,
  ShieldCheck,
  Smartphone,
  Sticker,
  Truck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import Link from "@/components/i18n/Link";
import { ProductVisual } from "@/components/storefront/ProductVisual";
import { OptionChip, UnitPicker, matchUnits, type BatteryRange } from "@/components/storefront/UnitPicker";
import { ConditionDashboard } from "@/components/storefront/ConditionDashboard";
import type { VariantData } from "@/components/storefront/ProductVariantExperience";
import { DeliveryPicker } from "@/components/cart/DeliveryPicker";
import { Button } from "@/components/ui/Button";
import { findCity } from "@/lib/delivery";
import { formatMAD } from "@/lib/format";
import { translateError } from "@/lib/i18n/labels";
import { whatsappLink } from "@/lib/site";
import type { OfferAddon, PhoneOfferUnit } from "@/lib/offers/phone-offers";
import type { OfferFormCopy } from "@/lib/offers/copy";
import { STORAGE_SLOT, type SpecRow } from "@/lib/offers/spec-row";
import { track } from "@/components/analytics/track";
import { metaTrack } from "@/components/analytics/meta";
import { submitOfferOrder } from "./actions";
import { TermsCheckbox } from "@/components/cart/TermsCheckbox";

const ADVANCE = 300;

// Add-ons come from the ERP: their icon follows their aisle.
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
const TRUST_ICONS: LucideIcon[] = [BatteryCharging, ShieldCheck, Check, Truck];
const GRADE_ORDER = ["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"];

/** "{rest}" → value. */
function fill(text: string, values: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? "");
}

const inputClass =
  "min-h-12 w-full rounded-2xl border border-ink/15 bg-white px-4 text-[15px] focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

export type OfferHero = {
  eyebrow: string;
  title: string;
  subtitle: string;
  lead: string;
  priceLabel: string;
  instead: string;
  cta: string;
  /** first item has a battery icon only when it is about the battery */
  trust: string[];
  batteryTrust: boolean;
};

type Props = {
  /** the page's slug: a model (/offres/iphone-14) or a brand (/offres/iphone) */
  slug: string;
  name: string;
  brand: string;
  hero: OfferHero;
  copy: OfferFormCopy;
  units: PhoneOfferUnit[];
  images: { url: string; altText: string | null }[];
  addons: OfferAddon[];
  /** each model's spec sheet, by its offer slug; the storage row holds STORAGE_SLOT */
  sheets: Record<string, SpecRow[]>;
  /** a brand page's models (chosen above grade and storage) */
  models?: { slug: string; name: string }[];
  /** "model": the model's own page (/telephones/<model>), every unit in stock */
  kind?: "promo" | "model";
  /** per model (offer slug): every grade, storage and colour it has had, the sold-out ones shown crossed out */
  options?: Record<string, OfferOptions>;
};

export type OfferOptions = { grades: string[]; storages: string[]; colors: string[] };

// "128 Go" and "128GB" are the same storage.
const storageKey = (s: string) => s.replace(/\s/g, "").toUpperCase().replace(/GO$/, "GB").replace(/TO$/, "TB");
const storageSize = (s: string) => parseInt(s) * (/TB|To/i.test(s) ? 1024 : 1);

function MissingHint({ text }: { text: string }) {
  return (
    <p role="alert" className="mb-3 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 ring-1 ring-red-200">
      <AlertCircle size={16} aria-hidden className="flex-none" /> {text}
    </p>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
        on ? "border-gold-deep bg-gold/15 font-semibold text-ink" : "border-ink/15 bg-white text-neutral-800 hover:border-ink/40"
      }`}
    >
      {children}
    </button>
  );
}

export function PhoneOfferExperience({ slug, name, brand, hero, copy, units, images, addons, sheets, models = [], options = {}, kind = "promo" }: Props) {
  const t = useT();
  const formRef = useRef<HTMLDivElement>(null);

  const grades = useMemo(() => GRADE_ORDER.filter((g) => units.some((u) => u.grade === g)), [units]);
  const storages = useMemo(() => [...new Set(units.map((u) => u.storage).filter((s): s is string => !!s))], [units]);
  const [grade, setGrade] = useState("all");
  const [storage, setStorage] = useState("all");
  const [model, setModel] = useState("all");
  const manyModels = models.length > 1;

  // The chips above the picker: every grade and storage the chosen model
  // (or, on a brand page, any model) has had; those with no unit in stock
  // stay, crossed out.
  const scopeUnits = units.filter((u) => model === "all" || u.offerSlug === model);
  const scopeOptions = model === "all" ? Object.values(options) : options[model] ? [options[model]] : [];
  const gradeChips = GRADE_ORDER.filter((g) => scopeUnits.some((u) => u.grade === g) || scopeOptions.some((o) => o.grades.includes(g)));
  const storageChips = (() => {
    const out = new Map<string, string>();
    for (const s of scopeUnits.map((u) => u.storage).filter((x): x is string => !!x)) if (!out.has(storageKey(s))) out.set(storageKey(s), s);
    for (const s of scopeOptions.flatMap((o) => o.storages)) if (!out.has(storageKey(s))) out.set(storageKey(s), s);
    return [...out.values()].sort((a, b) => storageSize(a) - storageSize(b));
  })();
  const scopeColors = [...new Set(scopeOptions.flatMap((o) => o.colors))];

  // The unit picker speaks the product page's shape. Grade and storage are
  // chosen above it, and written on each card when the units mix them.
  const toVariant = (u: PhoneOfferUnit): VariantData => ({
    id: u.id,
    name: u.name,
    priceOverride: String(u.price),
    compareAtPrice: u.normalPrice > u.price ? String(u.normalPrice) : null,
    color: u.color,
    storageLabel: u.storage,
    imageUrl: u.imageUrl,
    stockQuantity: u.stockQuantity,
    batteryHealthPercent: u.batteryHealthPercent,
    batteryGenuine: u.batteryGenuine,
    screenGenuine: u.screenGenuine,
    faceIdWorking: u.faceIdWorking,
    cameraGenuine: u.cameraGenuine,
    chargingPortGenuine: u.chargingPortGenuine,
    speakerGenuine: u.speakerGenuine,
    hasDefects: u.hasDefects,
    transparencyNotes: null,
    badge:
      [manyModels ? u.model : null, grades.length > 1 ? (t.grades.label[u.grade] ?? u.grade) : null, storages.length > 1 ? u.storage : null]
        .filter(Boolean)
        .join(" · ") || undefined,
  });
  const inScope = (g: string, s: string, m: string) =>
    units
      .filter((u) => (m === "all" || u.offerSlug === m) && (g === "all" || u.grade === g) && (s === "all" || u.storage === s))
      .map(toVariant);
  const variants = inScope(grade, storage, model);

  // Opens on the best unit's colour: a few cards to choose from instead of
  // every unit in stock (the colour chips are one tap away).
  const first = matchUnits(variants, "all", "all")[0];
  const [color, setColor] = useState(first?.color ?? "all");
  const [battery, setBattery] = useState<BatteryRange>("all");
  const [unitId, setUnitId] = useState<string | undefined>(first?.id);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [city, setCity] = useState<string | null>(null);
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // What's missing, shown right at the field the page scrolls to.
  const [missingAt, setMissingAt] = useState<{ id: string; text: string } | null>(null);
  const [done, setDone] = useState<{ reference: string; whatsappUrl: string; phone: string } | null>(null);
  const [imageIndex, setImageIndex] = useState<number | null>(null);

  const unit = units.find((u) => u.id === unitId);

  // Offer page seen: Meta's "ViewContent" (once), with the catalogue's unit id.
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current || !unit) return;
    viewed.current = true;
    metaTrack("ViewContent", { value: unit.price, content_ids: [unit.id], content_type: "product", content_name: unit.productName });
  }, [unit]);
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

  // After any change of filter, keep the chosen phone if it still matches,
  // else take the best match.
  function refilter(next: { model?: string; grade?: string; storage?: string; color?: string; battery?: BatteryRange }) {
    const m = next.model ?? model;
    const g = next.grade ?? grade;
    const s = next.storage ?? storage;
    const c = next.color ?? color;
    const b = next.battery ?? battery;
    setModel(m);
    setGrade(g);
    setStorage(s);
    setColor(c);
    setBattery(b);
    let pool = inScope(g, s, m);
    // A grade with no unit in the chosen storage (or the reverse): drop the other filter.
    if (!pool.length) {
      const g2 = next.grade !== undefined ? g : "all";
      const s2 = next.storage !== undefined ? s : "all";
      setGrade(g2);
      setStorage(s2);
      pool = inScope(g2, s2, m);
    }
    let matches = matchUnits(pool, c, b);
    // A colour or battery range this grade/storage doesn't have: start over on colour and battery.
    if (!matches.length && (next.model !== undefined || next.grade !== undefined || next.storage !== undefined)) {
      setColor("all");
      setBattery("all");
      matches = matchUnits(pool, "all", "all");
    }
    if (!matches.some((u) => u.id === unitId)) setUnitId(matches[0]?.id);
    setImageIndex(null);
  }

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
    // Something missing: say what, and bring it into view (a dead button
    // would look like the tap was lost).
    const missing: [string, string] | null = !unitId
      ? [copy.needUnit, "offer-units"]
      : !city
        ? [copy.needCity, "offer-city"]
        : !customer.trim()
          ? [copy.needName, "offer-name"]
          : !phone.trim()
            ? [copy.needPhone, "offer-phone"]
            : !termsAccepted
              ? [t.checkout.errors.terms, "offer-terms"]
              : null;
    if (missing) {
      setMissingAt({ id: missing[1], text: missing[0] });
      const el = document.getElementById(missing[1]);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLInputElement) el.focus({ preventScroll: true });
      return;
    }
    if (!unitId || !city) return;
    setBusy(true);
    setError(null);
    try {
      const r = await submitOfferOrder({
        // The unit's model page sells it; a brand page is where it came from.
        slug: unit?.offerSlug ?? slug,
        kind,
        via: slug,
        unitId,
        addons: [...picked],
        customerName: customer,
        customerPhone: phone,
        deliveryCity: city,
        termsAccepted,
      });
      if (r.ok) {
        // Counted in the ERP's sales funnel like an add to cart (this page has no cart).
        if (unit) {
          track({ t: "add_to_cart", pid: unit.productId, v: total });
          metaTrack("Purchase", { value: total, content_ids: [unit.id], content_type: "product", num_items: 1 + picked.size }, r.reference);
        }
        setDone({ reference: r.reference, whatsappUrl: r.whatsappUrl, phone });
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else setError(translateError(t, r.error));
    } catch {
      setError(copy.failed);
    } finally {
      setBusy(false);
    }
  }

  const condition = unit
    ? {
        batteryHealthPercent: unit.batteryHealthPercent,
        batteryGenuine: unit.batteryGenuine,
        screenGenuine: unit.screenGenuine,
        faceIdWorking: unit.faceIdWorking,
        cameraGenuine: unit.cameraGenuine,
        chargingPortGenuine: unit.chargingPortGenuine,
        speakerGenuine: unit.speakerGenuine,
      }
    : null;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
      {/* ── Gallery ── */}
      <div className="md:sticky md:top-28 md:self-start">
        <div className="relative aspect-square overflow-hidden rounded-4xl border border-ink/7 bg-white shadow-[0_30px_60px_-40px_rgb(17_16_19/0.5)]">
          <ProductVisual image={shown} name={name} brand={brand} isPhone priority size="large" sizes="(min-width: 768px) 50vw, 100vw" />
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
            <p className="text-sm font-medium text-neutral-600">
              {hero.priceLabel}
              {manyModels && <span className="font-semibold text-ink"> · {unit.model}</span>}
            </p>
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
            const Icon = (hero.batteryTrust ? TRUST_ICONS : TRUST_ICONS.slice(1))[i] ?? Check;
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
              <p className="mt-4 leading-relaxed text-neutral-200">{fill(copy.successText, { phone: done.phone })}</p>
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
              <Link
                href={`/commande/suivi?ref=${done.reference}`}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 px-6 text-sm font-semibold text-white"
              >
                <Truck size={17} aria-hidden /> {t.orderTracking.success}
              </Link>
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
            <form onSubmit={submit} noValidate className="mt-8 rounded-4xl border border-ink/8 bg-white p-4 shadow-[0_30px_60px_-45px_rgb(17_16_19/0.45)] sm:p-6">
              <h2 className="font-display text-2xl font-bold text-ink">{copy.title}</h2>

              <div id="offer-units" className="mt-5 scroll-mt-28 space-y-5">
                {missingAt?.id === "offer-units" && <MissingHint text={missingAt.text} />}
                {manyModels && (
                  <div>
                    <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">{copy.model}</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip on={model === "all"} onClick={() => refilter({ model: "all" })}>
                        {copy.all}
                      </Chip>
                      {models.map((m) => (
                        <Chip key={m.slug} on={model === m.slug} onClick={() => refilter({ model: m.slug })}>
                          {m.name}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )}
                {gradeChips.length > 1 && (
                  <div>
                    <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">{copy.grade}</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip on={grade === "all"} onClick={() => refilter({ grade: "all" })}>
                        {copy.all}
                      </Chip>
                      {gradeChips.map((g) => (
                        <OptionChip
                          key={g}
                          on={grade === g}
                          onClick={() => refilter({ grade: g })}
                          disabled={!scopeUnits.some((u) => u.grade === g)}
                          unavailableLabel={t.unitPicker.unavailable}
                        >
                          {t.grades.label[g] ?? g}
                        </OptionChip>
                      ))}
                    </div>
                  </div>
                )}
                {storageChips.length > 1 && (
                  <div>
                    <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">{copy.storage}</p>
                    <div className="flex flex-wrap gap-2">
                      <Chip on={storage === "all"} onClick={() => refilter({ storage: "all" })}>
                        {copy.all}
                      </Chip>
                      {storageChips.map((s) => (
                        <OptionChip
                          key={s}
                          on={storage === s}
                          onClick={() => refilter({ storage: s })}
                          disabled={!scopeUnits.some((u) => u.storage === s)}
                          unavailableLabel={t.unitPicker.unavailable}
                        >
                          {s}
                        </OptionChip>
                      ))}
                    </div>
                  </div>
                )}
                <UnitPicker
                  units={variants}
                  allColors={scopeColors}
                  color={color}
                  battery={battery}
                  selectedId={unitId}
                  onColor={(c) => refilter({ color: c, battery: "all" })}
                  onBattery={(b) => refilter({ battery: b })}
                  onSelect={(id) => {
                    setUnitId(id);
                    setImageIndex(null);
                  }}
                />
                {condition && (
                  <ConditionDashboard
                    {...condition}
                    specs={(unit ? (sheets[unit.offerSlug] ?? []) : [])
                      .map((row) => (row.value === STORAGE_SLOT ? { ...row, value: unit?.storage ?? "" } : row))
                      .filter((row) => row.value)}
                  />
                )}
              </div>

              {/* Suggested add-ons */}
              {addons.length > 0 && (
                <section className="mt-7" aria-labelledby="offer-addons">
                  <h3 id="offer-addons" className="text-sm font-semibold text-neutral-700">{copy.addons}</h3>
                  <p className="mt-1 text-xs text-neutral-500">{copy.addonsHint}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
                    {addons.map((a) => {
                      const on = picked.has(a.key);
                      const Icon = AISLE_ICONS[a.categorySlug] ?? Plus;
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
                            <span className="min-w-0 flex-1 text-sm font-semibold text-ink">{a.name}</span>
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
              <section id="offer-city" className="mt-7 scroll-mt-28">
                {missingAt?.id === "offer-city" && <MissingHint text={missingAt.text} />}
                <h3 className="mb-3 text-sm font-semibold text-neutral-700">{copy.delivery}</h3>
                <DeliveryPicker
                  value={city}
                  onChangeAction={(c) => {
                    // Choosing a town = starting to order (once per visit).
                    if (c && !city && unit) metaTrack("InitiateCheckout", { value: unit.price, content_ids: [unit.id], content_type: "product" });
                    setCity(c);
                    setMissingAt(null);
                  }}
                />
              </section>

              {/* Contact */}
              <section className="mt-7 space-y-3" aria-labelledby="offer-contact">
                <h3 id="offer-contact" className="text-sm font-semibold text-neutral-700">{copy.contact}</h3>
                {(missingAt?.id === "offer-name" || missingAt?.id === "offer-phone") && <MissingHint text={missingAt.text} />}
                <input
                  id="offer-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder={copy.fullName}
                  aria-label={copy.fullName}
                  value={customer}
                  onChange={(e) => {
                    setCustomer(e.target.value);
                    setMissingAt(null);
                  }}
                  maxLength={120}
                  className={inputClass}
                />
                <div className="relative">
                  <Phone size={17} aria-hidden className="pointer-events-none absolute inset-s-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="offer-phone"
                    type="tel"
                    required
                    dir="ltr"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder={copy.phone}
                    aria-label={copy.phone}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setMissingAt(null);
                    }}
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
                    <dt className="text-neutral-700">
                      {unit ? `${unit.productName} · ${t.grades.label[unit.grade] ?? unit.grade}` : name}
                    </dt>
                    <dd className="readout font-semibold">{unit ? formatMAD(unit.price) : "-"}</dd>
                  </div>
                  {addons
                    .filter((a) => picked.has(a.key))
                    .map((a) => (
                      <div key={a.key} className="flex justify-between gap-4">
                        <dt className="text-neutral-700">{a.name}</dt>
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

              {/* The terms of sale, accepted before ordering (law 31-08). */}
              <div className="mt-4 scroll-mt-28">
                {missingAt?.id === "offer-terms" && <MissingHint text={missingAt.text} />}
                <TermsCheckbox
                  id="offer-terms"
                  checked={termsAccepted}
                  onChange={(v) => {
                    setTermsAccepted(v);
                    setMissingAt(null);
                  }}
                  invalid={missingAt?.id === "offer-terms"}
                />
              </div>

              {error && (
                <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <Button type="submit" variant="accent" size="lg" loading={busy} className="mt-5 w-full">
                {busy ? (
                  copy.sending
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
