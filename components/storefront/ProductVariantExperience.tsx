"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { Check, MessageCircle, Minus, Plus, ShieldCheck, ShoppingBag, Store, Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD, savingOf } from "@/lib/format";
import { swatch } from "@/lib/colors";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProductVisual } from "@/components/storefront/ProductVisual";
import { GradeMeter } from "@/components/storefront/GradeMeter";
import { whatsappLink } from "@/lib/site";
import { ConditionDashboard, type ConditionData } from "@/components/storefront/ConditionDashboard";
import { Select } from "@/components/ui/Select";
import { UnitPicker, matchUnits, type BatteryRange } from "@/components/storefront/UnitPicker";
import { useT } from "@/components/i18n/I18nProvider";
import { colorName } from "@/lib/i18n/labels";

export type VariantData = ConditionData & {
  id: string;
  name: string;
  priceOverride: string | null;
  /** price before the ERP promo on this unit, null = no promo */
  compareAtPrice: string | null;
  color: string | null;
  storageLabel: string | null;
  imageUrl: string | null;
  stockQuantity: number;
  hasDefects: boolean;
  transparencyNotes: string | null;
};

export type ProductVariantExperienceData = {
  id: string;
  name: string;
  brand: string | null;
  conditionLabel: string;
  /** grade code (NEUF, TRES_BON, BON, PIECES_REMPLACEES) */
  grade: string;
  isPhone: boolean;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "COMING_SOON" | "DISCONTINUED";
  recommendedSalePrice: string;
  compareAtPrice: string | null;
  description: string | null;
  hasDefects: boolean;
  transparencyNotes: string | null;
  condition: ConditionData;
};

type Props = {
  product: ProductVariantExperienceData;
  variants: VariantData[];
  images: { url: string; altText: string | null }[];
  categorySlug: string;
  children?: ReactNode; // static content (specs/compatibility/gift/bundle) rendered after the transparency block
};

// A variant only sets what actually differs for that unit — everything
// else falls back to the product's own answer, field by field.
function pick<T>(variantValue: T | null | undefined, productValue: T): T {
  return variantValue === null || variantValue === undefined ? productValue : variantValue;
}

export function ProductVariantExperience({ product, variants, images, categorySlug, children }: Props) {
  const t = useT();
  const p = t.pdp;
  const [imageIndex, setImageIndex] = useState(0);
  const coverImage = images[imageIndex] ?? images[0] ?? null;
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Used phones: every unit differs → colour, battery range, then pick a unit.
  // New phones keep the colour / storage swatches.
  const unitMode = product.isPhone && product.grade !== "NEUF" && variants.length > 0;
  const [unitColor, setUnitColor] = useState("all");
  const [unitBattery, setUnitBattery] = useState<BatteryRange>("all");
  const hasColorVariants = !unitMode && variants.some((v) => v.color);
  const hasStorageVariants = variants.some((v) => v.storageLabel);

  const distinctColors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter((c): c is string => Boolean(c)))],
    [variants]
  );

  function storagesForColor(color: string) {
    return [
      ...new Set(
        variants
          .filter((v) => v.color === color)
          .map((v) => v.storageLabel)
          .filter((s): s is string => Boolean(s))
      ),
    ];
  }

  function comboDisabled(color: string, storage: string | null) {
    const match = variants.find((v) => v.color === color && v.storageLabel === storage);
    return !match || match.stockQuantity <= 0;
  }

  const [selectedColor, setSelectedColor] = useState<string | null>(distinctColors[0] ?? null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(
    selectedColor ? (storagesForColor(selectedColor).find((s) => !comboDisabled(selectedColor, s)) ?? storagesForColor(selectedColor)[0] ?? null) : null
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    unitMode ? matchUnits(variants, "all", "all")[0]?.id ?? variants[0]?.id : variants[0]?.id
  );

  // Changing a filter keeps the selection on a unit that matches it.
  function applyUnitFilters(color: string, battery: BatteryRange) {
    setUnitColor(color);
    setUnitBattery(battery);
    const matches = matchUnits(variants, color, battery);
    if (!matches.some((u) => u.id === selectedVariantId)) setSelectedVariantId(matches[0]?.id);
  }

  function handleSelectColor(color: string) {
    setSelectedColor(color);
    const storages = storagesForColor(color);
    const preferred = storages.find((s) => !comboDisabled(color, s));
    setSelectedStorage(preferred ?? storages[0] ?? null);
  }

  let selectedVariant: VariantData | undefined;
  if (hasColorVariants) {
    selectedVariant = variants.find(
      (v) => v.color === selectedColor && (!hasStorageVariants || v.storageLabel === selectedStorage)
    );
  } else if (variants.length > 0) {
    selectedVariant = variants.find((v) => v.id === selectedVariantId);
  }

  const price = Number(selectedVariant?.priceOverride ?? product.recommendedSalePrice);
  // A unit with its own price carries its own promo; otherwise the product's applies.
  const wasPrice = selectedVariant?.priceOverride ? selectedVariant.compareAtPrice : product.compareAtPrice;
  const saving = savingOf(price, wasPrice);
  const displayImage = selectedVariant?.imageUrl
    ? { url: selectedVariant.imageUrl, altText: product.name }
    : coverImage;

  const condition: ConditionData = {
    batteryHealthPercent: pick(selectedVariant?.batteryHealthPercent, product.condition.batteryHealthPercent),
    batteryGenuine: pick(selectedVariant?.batteryGenuine, product.condition.batteryGenuine),
    screenGenuine: pick(selectedVariant?.screenGenuine, product.condition.screenGenuine),
    faceIdWorking: pick(selectedVariant?.faceIdWorking, product.condition.faceIdWorking),
    cameraGenuine: pick(selectedVariant?.cameraGenuine, product.condition.cameraGenuine),
    chargingPortGenuine: pick(selectedVariant?.chargingPortGenuine, product.condition.chargingPortGenuine),
    speakerGenuine: pick(selectedVariant?.speakerGenuine, product.condition.speakerGenuine),
  };
  const hasDefects = selectedVariant ? selectedVariant.hasDefects : product.hasDefects;
  const transparencyNotes = selectedVariant ? selectedVariant.transparencyNotes : product.transparencyNotes;

  // A synced used phone is a single unit — never let the customer ask for 2.
  const maxQuantity = selectedVariant ? Math.max(1, Math.min(20, selectedVariant.stockQuantity)) : 20;
  const variantOutOfStock = variants.length > 0 && (!selectedVariant || selectedVariant.stockQuantity <= 0);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        variantId: selectedVariant?.id,
        productName: product.name,
        variantName: selectedVariant?.name,
        price,
        image: displayImage?.url,
        isPhone: product.isPhone,
      },
      Math.min(quantity, maxQuantity)
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  const inStock = product.availability === "IN_STOCK";
  const usedPhone = product.isPhone && product.grade !== "NEUF";
  const unitsInStock = variants.filter((v) => v.stockQuantity > 0).length;

  return (
    <>
      {/* ── Gallery ── */}
      <div className="md:sticky md:top-28 md:self-start">
        <div className="group relative aspect-square overflow-hidden rounded-[2rem] border border-ink/7 bg-white shadow-[0_30px_60px_-40px_rgb(17_16_19/0.5)]">
          <ProductVisual
            image={displayImage}
            name={product.name}
            brand={product.brand}
            categorySlug={categorySlug}
            isPhone={product.isPhone}
            priority
            size="large"
            sizes="(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw"
          />
          {saving !== null && (
            <span dir="ltr" className="readout absolute inset-s-4 top-4 z-3 rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
              -{formatMAD(saving)}
            </span>
          )}
        </div>
        {images.length > 1 && !selectedVariant?.imageUrl && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label={p.photos}>
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={p.photo(i + 1)}
                aria-pressed={i === imageIndex}
                className={`relative h-20 w-20 flex-none overflow-hidden rounded-2xl border-2 bg-white transition-colors ${
                  i === imageIndex ? "border-ink" : "border-transparent hover:border-ink/20"
                }`}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-contain p-1.5" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Details ── */}
      <div>
        {product.brand && (
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{product.brand}</p>
        )}
        <h1 className="font-display mt-2 text-[2.2rem] font-extrabold leading-[1.02] text-ink sm:text-5xl">{product.name}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {product.isPhone ? <GradeMeter grade={product.grade} size="md" /> : <Badge>{product.conditionLabel}</Badge>}
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <span
              aria-hidden
              className={`h-2 w-2 rounded-full ${inStock && !variantOutOfStock ? "bg-signal shadow-[0_0_0_4px_rgb(31_122_69/0.15)]" : "bg-neutral-400"}`}
            />
            {inStock && !variantOutOfStock
              ? p.inStock
              : product.availability === "COMING_SOON"
                ? p.comingSoon
                : p.unavailable}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
          <p dir="ltr" className="readout text-[2.6rem] font-bold leading-none text-ink">{formatMAD(price)}</p>
          {saving !== null && wasPrice && (
            <p dir="ltr" className="readout pb-1 text-lg text-neutral-500 line-through">{formatMAD(wasPrice)}</p>
          )}
        </div>
        {unitMode && unitsInStock > 1 && (
          <p className="mt-1.5 text-sm text-neutral-600">{p.priceOfSelected}</p>
        )}

        <ConditionDashboard {...condition} />

        {hasDefects && transparencyNotes && (
          <div className="mt-4 rounded-[1.25rem] border border-amber-300 bg-amber-50 p-4">
            <p className="text-sm font-bold text-amber-900">{p.transparency}</p>
            <p className="mt-1 text-sm text-amber-900">{transparencyNotes}</p>
          </div>
        )}

        {inStock ? (
          <div className="mt-7 space-y-5">
            {hasColorVariants && (
              <fieldset>
                <legend className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
                  {p.color}{selectedColor ? ` · ${colorName(t, selectedColor)}` : ""}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {distinctColors.map((color) => {
                    const fullyOut =
                      storagesForColor(color).every((s) => comboDisabled(color, s)) &&
                      (!hasStorageVariants ? comboDisabled(color, null) : true);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleSelectColor(color)}
                        disabled={fullyOut}
                        aria-pressed={selectedColor === color}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          selectedColor === color ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:border-ink/40"
                        }`}
                      >
                        <span aria-hidden className="h-4 w-4 rounded-full border border-ink/15" style={{ background: swatch(color) }} />
                        {colorName(t, color)}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {hasColorVariants && hasStorageVariants && selectedColor && (
              <fieldset>
                <legend className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600">{p.storage}</legend>
                <div className="flex flex-wrap gap-2">
                  {storagesForColor(selectedColor).map((storage) => {
                    const disabled = comboDisabled(selectedColor, storage);
                    return (
                      <button
                        key={storage}
                        type="button"
                        onClick={() => setSelectedStorage(storage)}
                        disabled={disabled}
                        aria-pressed={selectedStorage === storage}
                        className={`readout min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:text-neutral-500 disabled:line-through disabled:opacity-60 ${
                          selectedStorage === storage ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:border-ink/40"
                        }`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {unitMode && (
              <UnitPicker
                units={variants}
                color={unitColor}
                battery={unitBattery}
                selectedId={selectedVariantId}
                onColor={(c) => applyUnitFilters(c, "all")}
                onBattery={(b) => applyUnitFilters(unitColor, b)}
                onSelect={setSelectedVariantId}
              />
            )}

            {!unitMode && !hasColorVariants && variants.length > 0 && (
              <Select
                aria-label={p.chooseVersion}
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="min-h-12 w-full rounded-2xl border border-ink/15 px-4 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stockQuantity <= 0}>
                    {v.name}
                    {v.stockQuantity <= 0 ? p.soldOutSuffix : ""}
                  </option>
                ))}
              </Select>
            )}

            <div className="flex items-stretch gap-3">
              {!unitMode && maxQuantity > 1 && (
                <div className="flex items-center rounded-full border border-ink/15 bg-white" role="group" aria-label={p.quantity}>
                  <button
                    type="button"
                    aria-label={p.removeOne}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-14 w-11 items-center justify-center rounded-s-full text-ink disabled:text-neutral-400"
                  >
                    <Minus size={16} />
                  </button>
                  <output aria-live="polite" className="readout w-6 text-center text-base font-bold">
                    {Math.min(quantity, maxQuantity)}
                  </output>
                  <button
                    type="button"
                    aria-label={p.addOne}
                    onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                    disabled={quantity >= maxQuantity}
                    className="flex h-14 w-11 items-center justify-center rounded-e-full text-ink disabled:text-neutral-400"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
              <Button onClick={handleAdd} disabled={variantOutOfStock} variant="accent" size="lg" className="flex-1">
                {variantOutOfStock ? (
                  p.soldOut
                ) : justAdded ? (
                  <>
                    <Check size={19} aria-hidden /> {p.added}
                  </>
                ) : (
                  <>
                    <ShoppingBag size={19} aria-hidden /> {p.addToCart}
                  </>
                )}
              </Button>
            </div>
            <span role="status" className="sr-only">
              {justAdded ? p.addedStatus(product.name) : ""}
            </span>

            <a
              href={whatsappLink(p.waQuestion(product.name, selectedVariant?.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-whatsapp/60 bg-whatsapp/10 text-sm font-semibold text-ink transition-colors hover:bg-whatsapp/20"
            >
              <MessageCircle size={18} aria-hidden /> {product.isPhone ? p.askPhone : p.askItem}
            </a>
          </div>
        ) : (
          <div className="mt-7 rounded-[1.25rem] bg-ink/5 p-5 text-sm text-neutral-700">
            <p className="font-semibold text-ink">
              {product.availability === "COMING_SOON" ? p.comingSoonLong : p.unavailableLong}
            </p>
            <a
              href={whatsappLink(p.waNotify(product.name))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-semibold text-ink underline decoration-whatsapp decoration-2 underline-offset-4"
            >
              {p.notifyWhatsapp}
            </a>
          </div>
        )}

        <ul className="mt-6 grid gap-2 text-sm text-neutral-700 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, text: usedPhone ? p.trustGuarantee : p.trustChecked },
            { icon: Truck, text: t.common.deliveryEverywhere },
            { icon: Store, text: p.trustShop },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 ring-1 ring-ink/6">
              <item.icon size={17} aria-hidden className="flex-none text-gold-deep" />
              {item.text}
            </li>
          ))}
        </ul>

        {product.description && (
          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink">{p.description}</h2>
            <p className="mt-2 leading-relaxed text-neutral-700">{product.description}</p>
          </div>
        )}

        {children}
      </div>
    </>
  );
}
