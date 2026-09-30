import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/public-products";
import { getCompatibilityTargetPhones } from "@/lib/db/compatibility";
import { getActiveBundlesForProduct } from "@/lib/db/bundles";
import { CompatibilitySelector } from "@/components/storefront/CompatibilitySelector";
import { GiftPicker } from "@/components/storefront/GiftPicker";
import { BundleOffer, type BundleOfferData } from "@/components/storefront/BundleOffer";
import { ProductCard } from "@/components/storefront/ProductCard";
import {
  ProductVariantExperience,
  type ProductVariantExperienceData,
  type VariantData,
} from "@/components/storefront/ProductVariantExperience";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONDITION_LABEL, CONDITION_SCHEMA } from "@/lib/conditions";
import { MAX_QTY } from "@/lib/db/cart-pricing";
import { formatMAD } from "@/lib/format";
import { JsonLd } from "@/lib/json-ld";
import { SITE_URL, absoluteUrl } from "@/lib/site";

export const revalidate = 60;

// Next.js 16: `params` is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

/** Cheapest in-stock unit's price (used phones), else the product price. */
function lowestPrice(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>): number {
  const units = product.variants
    .filter((v) => v.stockQuantity > 0 && v.priceOverride)
    .map((v) => Number(v.priceOverride!.toString()));
  return units.length ? Math.min(...units) : Number(product.recommendedSalePrice.toString());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const condition = CONDITION_LABEL[product.condition] ?? product.condition;
  const title = product.metaTitle ?? (product.isPhone ? `${product.name} ${condition.toLowerCase()}` : product.name);
  const description =
    product.metaDescription ??
    product.description ??
    `${product.name}${product.isPhone ? ` (${condition.toLowerCase()})` : ""} à ${formatMAD(lowestPrice(product))} chez Electro Zaki, Meknès.${
      product.isPhone && product.condition !== "NEUF" ? " État et batterie affichés pour chaque unité." : ""
    } Livraison partout au Maroc.`;
  const cover = product.images[0];
  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      type: "website",
      title: `${title} | Electro Zaki`,
      description,
      url: `/products/${slug}`,
      ...(cover ? { images: [{ url: cover.url, alt: cover.altText ?? product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [compatibilityPhones, rawBundles, related] = await Promise.all([
    product.compatibleWithPhones.length ? getCompatibilityTargetPhones() : Promise.resolve([]),
    product.isPhone ? getActiveBundlesForProduct(product.id) : Promise.resolve([]),
    getRelatedProducts(product, 4),
  ]);
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
    // Stock depth is private: the browser only needs "in stock" and the most
    // one order line can take (the cart caps it at MAX_QTY server-side), so
    // anything above that is sent as MAX_QTY — same behavior, nothing more.
    stockQuantity: Math.min(v.stockQuantity, MAX_QTY),
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

  const inStock = product.availability === "IN_STOCK";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category.name,
    image: product.images.map((i) => absoluteUrl(i.url)),
    url: absoluteUrl(`/products/${product.slug}`),
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: "MAD",
      price: String(lowestPrice(product)),
      itemCondition: CONDITION_SCHEMA[product.condition] ?? "https://schema.org/UsedCondition",
      availability:
        product.availability === "IN_STOCK"
          ? "https://schema.org/InStock"
          : product.availability === "COMING_SOON"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/OutOfStock",
      seller: { "@id": `${SITE_URL}/#store` },
    },
  };

  const crumbs = [
    { name: "Accueil", path: "/" },
    { name: product.category.name, path: `/collections/${product.category.slug}` },
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:pt-8">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs} className="mb-6" />

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        <ProductVariantExperience
          product={productData}
          variants={variantsData}
          images={product.images.map((i) => ({ url: i.url, altText: i.altText }))}
          categorySlug={product.category.slug}
        >
          {Object.keys(specs).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink">Caractéristiques</h2>
              <dl className="mt-3 divide-y divide-ink/7 rounded-[1.25rem] bg-white px-5 ring-1 ring-ink/7">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-neutral-600">{key}</dt>
                    <dd className="readout text-right font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Accessory compatibility — known-compatible phones as a
              quick-scan list, plus the interactive "pick your phone" checker
              below it for anyone whose phone isn't in that list. */}
          {product.compatibleWithPhones.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink">Compatible avec</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.compatibleWithPhones.map((c) => (
                  <li key={c.compatibleWith.id}>
                    <Link
                      href={`/products/${c.compatibleWith.slug}`}
                      className="inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-sm font-medium text-ink ring-1 ring-ink/10 transition-colors hover:ring-ink/30"
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

      {related.length > 0 && (
        <section aria-labelledby="rayon" className="mt-20 sm:mt-28">
          <SectionHeading
            id="rayon"
            eyebrow={product.category.name}
            title={inStock ? "Dans le même rayon." : "À voir aussi."}
            action={
              <Link
                href={`/collections/${product.category.slug}`}
                className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4"
              >
                Tout le rayon {product.category.name}
              </Link>
            }
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
