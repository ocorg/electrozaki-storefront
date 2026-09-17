import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getProductBySlug } from "@/lib/db/public-products";
import { formatMAD } from "@/lib/format";
import { AddToCartControls } from "@/components/cart/AddToCartControls";

export const revalidate = 60;

// Next.js 16: `params` is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

const CONDITION_LABEL: Record<string, string> = {
  NEW: "Neuf",
  REFURBISHED: "Reconditionné",
  USED: "Occasion",
};

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

  const specs = (product.specs ?? {}) as Record<string, string>;
  const cover = product.images[0];

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
          <span className="text-xl font-semibold text-[#c8922a]">
            {formatMAD(product.recommendedSalePrice.toString())}
          </span>
          {product.compareAtPrice && (
            <span className="text-neutral-400 line-through">
              {formatMAD(product.compareAtPrice.toString())}
            </span>
          )}
        </div>

        <span className="mt-2 inline-block rounded-full bg-black/5 px-3 py-1 text-xs">
          {CONDITION_LABEL[product.condition] ?? product.condition}
        </span>

        {product.description && (
          <p className="mt-4 text-neutral-700">{product.description}</p>
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
