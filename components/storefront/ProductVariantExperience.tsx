"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { Check, ImageOff, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConditionDashboard, type ConditionData } from "@/components/storefront/ConditionDashboard";

export type VariantData = ConditionData & {
  id: string;
  name: string;
  priceOverride: string | null;
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
  isPhone: boolean;
  availability: "IN_STOCK" | "OUT_OF_STOCK" | "COMING_SOON" | "DISCONTINUED";
  recommendedSalePrice: string;
  compareAtPrice: string | null;
  percentOff: number | null;
  description: string | null;
  hasDefects: boolean;
  transparencyNotes: string | null;
  condition: ConditionData;
};

type Props = {
  product: ProductVariantExperienceData;
  variants: VariantData[];
  coverImage: { url: string; altText: string | null } | null;
  children?: ReactNode; // static content (specs/compatibility/gift/bundle) rendered after the transparency block
};

// A variant only sets what actually differs for that unit — everything
// else falls back to the product's own answer, field by field.
function pick<T>(variantValue: T | null | undefined, productValue: T): T {
  return variantValue === null || variantValue === undefined ? productValue : variantValue;
}

export function ProductVariantExperience({ product, variants, coverImage, children }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const hasColorVariants = variants.some((v) => v.color);
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(variants[0]?.id);

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
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-50 shadow-sm">
        {displayImage ? (
          <Image
            src={displayImage.url}
            alt={displayImage.altText ?? product.name}
            fill
            className="object-contain p-6"
            sizes="(min-width: 768px) 40vw, 90vw"
            priority
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
            <ImageOff size={28} />
            <span className="text-sm">Image à venir</span>
          </div>
        )}
      </div>

      <div>
        {product.brand && (
          <p className="text-sm uppercase tracking-wide text-neutral-500">{product.brand}</p>
        )}
        <h1 className="text-2xl font-semibold sm:text-3xl">{product.name}</h1>

        <div className="mt-3 flex items-baseline gap-3">
          <span className="rounded-lg bg-ink px-3 py-1.5 text-xl font-bold text-gold">
            {formatMAD(price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-neutral-500 line-through">{formatMAD(product.compareAtPrice)}</span>
          )}
          {product.percentOff !== null && <Badge tone="sale">-{product.percentOff}%</Badge>}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{product.conditionLabel}</Badge>
        </div>

        <ConditionDashboard {...condition} />

        {product.description && <p className="mt-4 text-neutral-700">{product.description}</p>}

        {hasDefects && transparencyNotes && (
          <div className="mt-4 rounded-xl border border-gold/40 bg-gold/5 p-4">
            <p className="text-sm font-semibold">Transparence</p>
            <p className="mt-1 text-sm text-neutral-700">{transparencyNotes}</p>
          </div>
        )}

        {children}

        {product.availability === "IN_STOCK" ? (
          <div className="mt-6 space-y-3">
            {hasColorVariants && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Couleur
                </p>
                <div className="flex flex-wrap gap-2">
                  {distinctColors.map((color) => {
                    const fullyOut = storagesForColor(color).every((s) => comboDisabled(color, s)) &&
                      (!hasStorageVariants ? comboDisabled(color, null) : true);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handleSelectColor(color)}
                        disabled={fullyOut}
                        className={`min-h-9 rounded-lg border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          selectedColor === color
                            ? "border-gold bg-gold/10 font-medium text-ink"
                            : "border-black/15 text-neutral-700 hover:border-gold"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {hasColorVariants && hasStorageVariants && selectedColor && (
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Stockage
                </p>
                <div className="flex flex-wrap gap-2">
                  {storagesForColor(selectedColor).map((storage) => {
                    const disabled = comboDisabled(selectedColor, storage);
                    return (
                      <button
                        key={storage}
                        type="button"
                        onClick={() => setSelectedStorage(storage)}
                        disabled={disabled}
                        className={`min-h-9 rounded-lg border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:text-neutral-400 disabled:line-through disabled:opacity-60 ${
                          selectedStorage === storage
                            ? "border-gold bg-gold/10 font-medium text-ink"
                            : "border-black/15 text-neutral-700 hover:border-gold"
                        }`}
                      >
                        {storage}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasColorVariants && variants.length > 0 && (
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stockQuantity <= 0}>
                    {v.name}
                    {v.stockQuantity <= 0 ? " — épuisé" : ""}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="min-h-11 w-20 rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
              />
              <Button onClick={handleAdd} disabled={variantOutOfStock} className="flex-1">
                {variantOutOfStock ? (
                  "Épuisé"
                ) : justAdded ? (
                  <>
                    <Check size={18} /> Ajouté
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Ajouter au panier
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-6 rounded-lg bg-black/5 px-4 py-3 text-sm text-neutral-600">
            {product.availability === "COMING_SOON"
              ? "Bientôt disponible — contactez-nous sur WhatsApp pour être prévenu."
              : "Actuellement indisponible."}
          </p>
        )}
      </div>
    </>
  );
}
