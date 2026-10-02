import { ArrowUpRight } from "lucide-react";
import Link from "@/components/i18n/Link";
import { formatMAD, savingOf } from "@/lib/format";
import type { PublicProduct } from "@/lib/db/public-products";
import { getT } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/labels";
import { ProductVisual } from "@/components/storefront/ProductVisual";
import { BatteryLevel, GradeMeter } from "@/components/storefront/GradeMeter";

export async function ProductCard({ product, priority = false }: { product: PublicProduct; priority?: boolean }) {
  const t = await getT();
  const cover = product.images[0];
  const isSoldOut = product.availability === "OUT_OF_STOCK" || product.availability === "DISCONTINUED";
  const isComingSoon = product.availability === "COMING_SOON";
  const inStockUnits = product.variants.filter((v) => v.stockQuantity > 0);
  // Used phones are sold unit by unit at different prices: show the lowest.
  const unitPrices = new Set(inStockUnits.filter((v) => v.priceOverride).map((v) => v.priceOverride!.toString()));
  const fromPrice = unitPrices.size > 1;
  // The card's price is the cheapest unit; its promo (if any) is on the
  // product. Other units may have their own promo: say so with "Promo".
  const saving = savingOf(product.recommendedSalePrice.toString(), product.compareAtPrice?.toString());
  const unitPromo = saving === null && inStockUnits.some((v) => v.compareAtPrice !== null);

  // Battery of the units on sale: one value, or the range across units.
  const batteries = [
    ...inStockUnits.map((v) => v.batteryHealthPercent),
    ...(inStockUnits.length ? [] : [product.batteryHealthPercent]),
  ].filter((b): b is number => b !== null);
  const bMin = batteries.length ? Math.min(...batteries) : null;
  const bMax = batteries.length ? Math.max(...batteries) : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[1.4rem] border border-ink/7 bg-white shadow-[0_1px_2px_rgb(17_16_19/0.04)] transition-[transform,box-shadow,border-color] duration-500 ease-out-quint hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_28px_50px_-26px_rgb(17_16_19/0.45)]"
    >
      <div className="shine relative m-1.5 mb-0 aspect-square overflow-hidden rounded-[1.1rem]">
        <ProductVisual
          image={cover}
          name={product.name}
          brand={product.brand}
          categorySlug={product.category.slug}
          isPhone={product.isPhone}
          priority={priority}
          sizes="(min-width: 1280px) 300px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        <div className="absolute inset-x-2 top-2 z-3 flex items-start justify-between gap-2">
          {isSoldOut || isComingSoon ? (
            <span className="rounded-full bg-ink/90 px-2.5 py-1 text-[11px] font-semibold text-white">
              {isComingSoon ? t.product.comingSoon : t.product.soldOut}
            </span>
          ) : (
            // No stock badge: quantities are private, and used phones are
            // sold one unit at a time, so "last one" would be on every card.
            <span />
          )}
          {(saving !== null || unitPromo) && (
            <span dir={saving !== null ? "ltr" : undefined} className="rounded-full bg-red-600 px-2.5 py-1 font-mono text-[11px] font-bold text-white">
              {saving !== null ? `-${formatMAD(saving)}` : t.product.promo}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3 sm:px-4 sm:pb-4">
        <p className="min-h-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          {product.brand ?? categoryName(t, product.category.slug, product.category.name)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.6em] text-[15px] font-semibold leading-snug text-ink" title={product.name}>
          {product.name}
        </h3>

        {product.isPhone && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <GradeMeter grade={product.condition} />
            {bMin !== null && bMax !== null && product.condition !== "NEUF" && (
              <BatteryLevel percent={bMax} label={bMin === bMax ? undefined : `${bMin}-${bMax} %`} />
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="leading-none">
            {fromPrice && <span className="mb-1 block text-[11px] font-medium text-neutral-500">{t.product.fromPrice}</span>}
            <span className="readout text-lg font-bold text-ink sm:text-xl">
              {formatMAD(product.recommendedSalePrice.toString())}
            </span>
            {saving !== null && product.compareAtPrice && (
              <span className="readout ms-1.5 text-xs text-neutral-500 line-through">
                {formatMAD(product.compareAtPrice.toString())}
              </span>
            )}
          </p>
          <span
            aria-hidden
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-paper text-ink transition-all duration-300 group-hover:rotate-45 group-hover:bg-gold"
          >
            <ArrowUpRight size={17} className="rtl:-scale-x-100" />
          </span>
        </div>
      </div>
    </Link>
  );
}
