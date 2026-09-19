import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/db/public-products";
import { getCompatibilityTargetPhones } from "@/lib/db/compatibility";
import { formatMAD } from "@/lib/format";
import { AddToCartControls } from "@/components/cart/AddToCartControls";
import { ConditionDashboard } from "@/components/storefront/ConditionDashboard";
import { CompatibilitySelector } from "@/components/storefront/CompatibilitySelector";
import { GiftPicker } from "@/components/storefront/GiftPicker";
import { CONDITION_LABEL } from "@/lib/conditions";

export const revalidate = 60;

// Next.js 16: `params` is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? `${product.name} — Electro Zaki`,
    description: product.metaDescription ?? product.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const compatibilityPhones = product.compatibleWithPhones.length
    ? await getCompatibilityTargetPhones()
    : [];

  const specs = (product.specs ?? {}) as Record<string, string>;
  const cover = product.images[0];
  const giftOptions = product.compatibleAccessories.filter((c) => c.isGiftOption);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    brand: product.brand ?? undefined,
    image: product.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: product.recommendedSalePrice.toString(),
      availability:
        product.availability === "IN_STOCK"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-50">
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.altText ?? product.name}
            fill
            className="object-contain p-6"
            sizes="(min-width: 768px) 40vw, 90vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            Image à venir
          </div>
        )}
      </div>

      <div>
        {product.brand && (
          <p className="text-sm uppercase tracking-wide text-neutral-500">{product.brand}</p>
        )}
        <h1 className="text-2xl font-semibold">{product.name}</h1>

        <div className="mt-2 flex items-baseline gap-3">
          <span className="rounded bg-[#121212] px-3 py-1.5 text-xl font-bold text-[#c8922a]">
            {formatMAD(product.recommendedSalePrice.toString())}
          </span>
          {product.compareAtPrice && (
            <span className="text-neutral-400 line-through">
              {formatMAD(product.compareAtPrice.toString())}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-block rounded-full bg-black/5 px-3 py-1 text-xs">
            {CONDITION_LABEL[product.condition] ?? product.condition}
          </span>
        </div>

        <ConditionDashboard
          batteryHealthPercent={product.batteryHealthPercent}
          batteryGenuine={product.batteryGenuine}
          screenGenuine={product.screenGenuine}
          faceIdWorking={product.faceIdWorking}
        />

        {product.description && (
          <p className="mt-4 text-neutral-700">{product.description}</p>
        )}

        {/* Phase-2 "transparency" block — only shown when the product actually
            has something to disclose, never a generic reassurance filler. */}
        {product.hasDefects && product.transparencyNotes && (
          <div className="mt-4 rounded-lg border border-[#c8922a]/40 bg-[#c8922a]/5 p-4">
            <p className="text-sm font-semibold">Transparence</p>
            <p className="mt-1 text-sm text-neutral-700">{product.transparencyNotes}</p>
          </div>
        )}

        {Object.keys(specs).length > 0 && (
          <dl className="mt-4 divide-y divide-black/10 border-t border-black/10">
            {Object.entries(specs).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 text-sm">
                <dt className="text-neutral-500">{key}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {/* Phase-2 accessory compatibility — known-compatible phones as a
            quick-scan list, plus the interactive "pick your phone" checker
            below it for anyone whose phone isn't in that list. */}
        {product.compatibleWithPhones.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Compatible avec</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {product.compatibleWithPhones.map((c) => (
                <li key={c.compatibleWith.id}>
                  <Link
                    href={`/products/${c.compatibleWith.slug}`}
                    className="inline-block rounded border border-black/10 px-2 py-1 text-xs hover:border-[#c8922a]"
                  >
                    {c.compatibleWith.name}
                  </Link>
                </li>
              ))}
            </ul>

            <CompatibilitySelector
              allPhones={compatibilityPhones}
              compatiblePhoneIds={product.compatibleWithPhones.map((c) => c.compatibleWith.id)}
            />
          </div>
        )}

        <GiftPicker giftOptions={giftOptions} />

        {product.availability === "IN_STOCK" ? (
          <div className="mt-6">
            <AddToCartControls
              productId={product.id}
              productName={product.name}
              image={cover?.url}
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                priceOverride: v.priceOverride ? v.priceOverride.toString() : null,
                skuOrRef: v.skuOrRef,
              }))}
              basePrice={product.recommendedSalePrice.toString()}
              isPhone={product.isPhone}
            />
          </div>
        ) : (
          <p className="mt-6 rounded bg-black/5 px-4 py-3 text-sm text-neutral-600">
            {product.availability === "COMING_SOON"
              ? "Bientôt disponible — contactez-nous sur WhatsApp pour être prévenu."
              : "Actuellement indisponible."}
          </p>
        )}
      </div>
    </div>
  );
}
