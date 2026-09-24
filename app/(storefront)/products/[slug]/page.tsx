import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/lib/db/public-products";
import { getCompatibilityTargetPhones } from "@/lib/db/compatibility";
import { getActiveBundlesForProduct } from "@/lib/db/bundles";
import { CompatibilitySelector } from "@/components/storefront/CompatibilitySelector";
import { GiftPicker } from "@/components/storefront/GiftPicker";
import { BundleOffer, type BundleOfferData } from "@/components/storefront/BundleOffer";
import {
  ProductVariantExperience,
  type ProductVariantExperienceData,
  type VariantData,
} from "@/components/storefront/ProductVariantExperience";
import { CONDITION_LABEL } from "@/lib/conditions";

export const revalidate = 60;

// Next.js 16: `params` is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.metaTitle ?? product.name,
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
  const rawBundles = product.isPhone ? await getActiveBundlesForProduct(product.id) : [];
  // Prisma Decimal fields can't cross the Server -> Client boundary as-is —
  // serialize before handing off to <BundleOffer>, a Client Component.
  const bundles: BundleOfferData[] = rawBundles.map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    bundlePrice: b.bundlePrice.toString(),
    items: b.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      product: {
        id: i.product.id,
        name: i.product.name,
        isPhone: i.product.isPhone,
        recommendedSalePrice: i.product.recommendedSalePrice.toString(),
        images: i.product.images,
      },
    })),
  }));

  const specs = (product.specs ?? {}) as Record<string, string>;
  const cover = product.images[0];
  const giftOptions = product.compatibleAccessories.filter((c) => c.isGiftOption);

  // Prisma Decimal fields (and the whole product/variant shape generally)
  // can't cross the Server -> Client boundary as-is — serialize before
  // handing off to <ProductVariantExperience>, a Client Component.
  const variantsData: VariantData[] = product.variants.map((v) => ({
    id: v.id,
    name: v.name,
    priceOverride: v.priceOverride ? v.priceOverride.toString() : null,
    compareAtPrice: v.compareAtPrice ? v.compareAtPrice.toString() : null,
    color: v.color,
    storageLabel: v.storageLabel,
    imageUrl: v.imageUrl,
    stockQuantity: v.stockQuantity,
    batteryHealthPercent: v.batteryHealthPercent,
    batteryGenuine: v.batteryGenuine,
    screenGenuine: v.screenGenuine,
    faceIdWorking: v.faceIdWorking,
    cameraGenuine: v.cameraGenuine,
    chargingPortGenuine: v.chargingPortGenuine,
    speakerGenuine: v.speakerGenuine,
    hasDefects: v.hasDefects,
    transparencyNotes: v.transparencyNotes,
  }));

  const productData: ProductVariantExperienceData = {
    id: product.id,
    name: product.name,
    brand: product.brand,
    conditionLabel: CONDITION_LABEL[product.condition] ?? product.condition,
    grade: product.condition,
    isPhone: product.isPhone,
    availability: product.availability,
    recommendedSalePrice: product.recommendedSalePrice.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
    description: product.description,
    hasDefects: product.hasDefects,
    transparencyNotes: product.transparencyNotes,
    condition: {
      batteryHealthPercent: product.batteryHealthPercent,
      batteryGenuine: product.batteryGenuine,
      screenGenuine: product.screenGenuine,
      faceIdWorking: product.faceIdWorking,
      cameraGenuine: product.cameraGenuine,
      chargingPortGenuine: product.chargingPortGenuine,
      speakerGenuine: product.speakerGenuine,
    },
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductVariantExperience
        product={productData}
        variants={variantsData}
        coverImage={cover ? { url: cover.url, altText: cover.altText } : null}
      >
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
                    className="inline-block rounded-lg border border-black/10 px-2.5 py-1.5 text-xs transition-colors hover:border-gold"
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

        {bundles.length > 0 && <BundleOffer bundles={bundles} />}
      </ProductVariantExperience>
    </div>
  );
}
