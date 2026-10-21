import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { getProductBySlug, getRelatedProducts } from "@/lib/db/public-products";
import { getCompatibilityTargetPhones } from "@/lib/db/compatibility";
import { getActiveBundlesForProduct } from "@/lib/db/bundles";
import { getFacetGroups } from "@/lib/db/facets";
import { MODEL_GROUP, optionsIn } from "@/lib/facets";
import { FitsYourPhone } from "@/components/storefront/RememberedPhone";
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
import { GuideLinks } from "@/components/storefront/GuideLinks";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONDITION_SCHEMA } from "@/lib/conditions";
import { MAX_QTY } from "@/lib/db/cart-pricing";
import { formatMAD, formatMADText } from "@/lib/format";
import { CITIES } from "@/lib/delivery/cities.generated";
import { JsonLd } from "@/lib/json-ld";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { LOCALE_META, localePath } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n/server";
import { categoryName, facetOptionName, specRow } from "@/lib/i18n/labels";
import { alternates } from "@/lib/i18n/seo";
import { Tag } from "lucide-react";
import { ACCESSORIES_OPEN } from "@/lib/site";
import { ComingSoon } from "@/components/storefront/ComingSoon";
import { artFor } from "@/lib/category-art";
import { offerForListing, offerSlug } from "@/lib/offers/phone-offers";
import { OFFER_COPY } from "@/lib/offers/copy";
import { SINGLE_SIM_NOTE, factsFor, isSingleSim, specRows } from "@/lib/offers/spec-sheet";
import { getModelOptions, type ModelListing } from "@/lib/db/model-options";
import { InspectionReport } from "@/components/storefront/InspectionReport";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { getReviewSummary, reviewJsonLd } from "@/lib/reviews";

export const revalidate = 3600;

// Pages are built on their first visit and then served from the cache
// (refreshed every hour and at once by the ERP): without this, Next renders
// every visit from scratch, with a database round trip each time.
export async function generateStaticParams() {
  return [];
}

// Next.js 16: `params` is a Promise and must be awaited.
type Props = { params: Promise<{ slug: string }> };

/** Cheapest in-stock unit's price (used phones), else the product price. */
function lowestPrice(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>): number {
  const units = product.variants
    .filter((v) => v.stockQuantity > 0 && v.priceOverride)
    .map((v) => Number(v.priceOverride!.toString()));
  return units.length ? Math.min(...units) : Number(product.recommendedSalePrice.toString());
}

// Delivery anywhere in Morocco with Ameex: the fee depends on the town
// (lib/delivery), shipped the same or next working day, 1 to 3 days on the way.
const FEES = CITIES.map((c) => c.fee);
const SHIPPING_DETAILS = {
  "@type": "OfferShippingDetails",
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "MA" },
  shippingRate: { "@type": "MonetaryAmount", currency: "MAD", minValue: Math.min(...FEES), maxValue: Math.max(...FEES) },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [product, t, locale] = await Promise.all([getProductBySlug(slug), getT(), getLocale()]);
  if (!product) return {};
  if (!product.isPhone && !ACCESSORIES_OPEN) return { title: t.comingSoon.title(product.name), robots: { index: false } };
  const condition = product.isPhone ? (t.grades.label[product.condition] ?? product.condition) : null;
  // The ERP's SEO fields and description are written in French: they're used
  // as-is on the French site only, the other languages get a generated line.
  const french = locale === "fr";
  // (not the description itself: it's often a technical note, the same on
  // several listings, like the Ultras' SIM note).
  const used = product.isPhone && product.condition !== "NEUF";
  const price = formatMADText(lowestPrice(product));
  const title = (french && product.metaTitle) || t.productPage.metaTitle(product.name, condition, used, price);
  const description = (french && product.metaDescription) || t.productPage.metaDescription(product.name, condition, price, used);
  const cover = product.images[0];
  const alt = alternates(locale, `/products/${slug}`);
  return {
    title,
    description,
    alternates: alt,
    openGraph: {
      type: "website",
      title: `${title} | Electro Zaki`,
      description,
      url: alt.canonical,
      locale: LOCALE_META[locale].ogLocale,
      ...(cover ? { images: [{ url: cover.url, alt: cover.altText ?? product.name }] } : {}),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, t, locale] = await Promise.all([getProductBySlug(slug), getT(), getLocale()]);
  if (!product) notFound();
  if (!product.isPhone && !ACCESSORIES_OPEN) {
    return <ComingSoon name={product.name} art={artFor(product.category.slug, product.category.name)} />;
  }
  const aisleName = categoryName(t, product.category.slug, product.category.name);

  // A phone whose model is on promo: point to the model's promo page, which
  // has every promo unit of it (all grades and storages) on one page.
  let offerBanner: { text: string; cta: string; href: string } | null = null;
  if (product.isPhone) {
    const offer = await offerForListing(product.slug);
    if (offer) {
      const c = OFFER_COPY[locale];
      offerBanner = { text: c.card.banner(offer.name, formatMAD(offer.fromPrice)), cta: c.card.cta, href: `/offres/${offer.slug}` };
    }
  }

  const [compatibilityPhones, rawBundles, related, facetGroups, reviews] = await Promise.all([
    product.compatibleWithPhones.length ? getCompatibilityTargetPhones() : Promise.resolve([]),
    product.isPhone ? getActiveBundlesForProduct(product.id) : Promise.resolve([]),
    getRelatedProducts(product, 4),
    product.facets.length ? getFacetGroups(product.category.slug) : Promise.resolve([]),
    // A phone shows the reviews of its whole model (every storage and grade).
    getReviewSummary({ modelKey: product.isPhone ? product.modelKey : null, productId: product.id }),
  ]);
  // The product's checklist, group by group, in the ERP's order. The phone
  // models it fits lead; each answer links back to the aisle, narrowed.
  const fiche = facetGroups
    .map((group) => ({
      group,
      max: Math.max(...group.options.map((o) => o.level ?? 0)),
      ticks: optionsIn(product.facets, group.key),
    }))
    .filter((row) => row.ticks.length > 0);
  const fitsModels = fiche.find((row) => row.group.key === MODEL_GROUP)?.ticks ?? [];
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
  // A phone whose model has a fact sheet: one full "Fiche de l'appareil"
  // (the ERP's RAM and storage included), instead of the short ERP table.
  const facts = product.isPhone ? factsFor(product.modelKey) : null;
  const specSheet = facts
    ? specRows(facts, locale, { storage: specs["Stockage"], ram: specs["RAM"]?.replace(/\s+/g, "") })
    : undefined;

  // A phone's other options: every colour of the model, and its other
  // listings (grade, storage), the sold-out ones shown crossed out.
  const modelOptions = product.isPhone && product.modelKey ? await getModelOptions(product.modelKey) : null;
  const siblings = modelOptions ? modelSiblings(modelOptions.listings, product.slug) : undefined;
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
    conditionLabel: t.grades.label[product.condition] ?? product.condition,
    grade: product.condition,
    isPhone: product.isPhone,
    availability: product.availability,
    recommendedSalePrice: product.recommendedSalePrice.toString(),
    compareAtPrice: product.compareAtPrice?.toString() ?? null,
    description: product.description || (isSingleSim(facts) ? SINGLE_SIM_NOTE : null),
    specSheet,
    modelColors: modelOptions?.colors,
    siblings,
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
    // The condition in the name: the same model is often listed in two or
    // three conditions, each its own page.
    name: product.isPhone ? `${product.name} - ${t.grades.label[product.condition] ?? product.condition}` : product.name,
    description:
      product.description ||
      t.productPage.metaDescription(
        product.name,
        product.isPhone ? (t.grades.label[product.condition] ?? product.condition) : null,
        formatMADText(lowestPrice(product)),
        product.isPhone && product.condition !== "NEUF"
      ),
    sku: product.id,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: aisleName,
    image: product.images.map((i) => absoluteUrl(i.url)),
    url: absoluteUrl(localePath(locale, `/products/${product.slug}`)),
    inLanguage: LOCALE_META[locale].htmlLang,
    offers: {
      "@type": "Offer",
      url: absoluteUrl(localePath(locale, `/products/${product.slug}`)),
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
      shippingDetails: SHIPPING_DETAILS,
    },
    ...reviewJsonLd(reviews),
  };

  // A phone's model page sits between the aisle and the listing
  // (Téléphones › iPhone 13 › iPhone 13 128GB): every unit of the model.
  const crumbs = [
    { name: t.common.home, path: "/" },
    { name: aisleName, path: `/collections/${product.category.slug}` },
    ...(facts && product.modelKey ? [{ name: facts.name, path: `/telephones/${offerSlug(product.modelKey)}` }] : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:pt-8">
      <JsonLd data={jsonLd} />
      <Breadcrumbs items={crumbs} className="mb-6" />
      {offerBanner && (
        <Link
          href={offerBanner.href}
          className="group mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl bg-ink px-5 py-4 text-white shadow-[0_20px_40px_-30px_rgb(17_16_19/0.8)]"
        >
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[30%] bg-gold text-ink">
            <Tag size={20} aria-hidden />
          </span>
          <span className="min-w-0 flex-1 font-semibold">{offerBanner.text}</span>
          <span className="inline-flex min-h-10 items-center rounded-full bg-gold px-5 text-sm font-bold text-ink transition-[filter] group-hover:brightness-105">
            {offerBanner.cta}
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
        <ProductVariantExperience
          product={productData}
          variants={variantsData}
          images={product.images.map((i) => ({ url: i.url, altText: i.altText }))}
          categorySlug={product.category.slug}
        >
          {product.isPhone && (
            <InspectionReport t={t} facts={facts} brand={product.brand} isNew={product.condition === "NEUF"} compact className="mt-8" />
          )}
          {fiche.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink">{t.guide.ficheTitle}</h2>
              <FitsYourPhone
                fits={fitsModels.map((o) => ({ key: o.key, name: o.name }))}
                aisleHref={`/collections/${product.category.slug}`}
              />
              <dl className="mt-3 divide-y divide-ink/7 rounded-[1.25rem] bg-white px-5 ring-1 ring-ink/7">
                {fiche.map(({ group, max, ticks }) => (
                  <div key={group.key} className="flex items-start justify-between gap-4 py-3 text-sm">
                    <dt className="flex-none pt-1.5 text-neutral-600">{group.name}</dt>
                    <dd className="flex flex-wrap justify-end gap-1.5">
                      {ticks.map((o) => (
                        <Link
                          key={o.key}
                          href={`/collections/${product.category.slug}?${group.key}=${encodeURIComponent(o.key)}`}
                          className="inline-flex min-h-8 items-center gap-2 rounded-full bg-paper px-3 text-[13px] font-semibold text-ink ring-1 ring-ink/7 transition-colors hover:ring-ink/30"
                        >
                          {group.display === "METER" && o.level !== null && (
                            <span className="flex items-end gap-0.5" aria-hidden>
                              {Array.from({ length: max }, (_, i) => (
                                <span
                                  key={i}
                                  className={`w-0.75 rounded-[1px] ${i < o.level! ? "bg-ink" : "bg-ink/15"}`}
                                  style={{ height: 5 + i * 3 }}
                                />
                              ))}
                            </span>
                          )}
                          {facetOptionName(t, group.key, o)}
                        </Link>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {!specSheet && Object.keys(specs).length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink">{t.productPage.specs}</h2>
              <dl className="mt-3 divide-y divide-ink/7 rounded-[1.25rem] bg-white px-5 ring-1 ring-ink/7">
                {Object.entries(specs).map(([rawKey, rawValue]) => {
                  const row = specRow(t, rawKey, String(rawValue));
                  return (
                    <div key={rawKey} className="flex justify-between gap-4 py-3 text-sm">
                      <dt className="text-neutral-600">{row.key}</dt>
                      <dd className="readout text-end font-semibold text-ink">{row.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          )}

          {/* Accessory compatibility — known-compatible phones as a
              quick-scan list, plus the interactive "pick your phone" checker
              below it for anyone whose phone isn't in that list. */}
          {product.compatibleWithPhones.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-bold text-ink">{t.productPage.compatible}</h2>
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

          {/* Used phones: the buying guides (checks, replaced parts, battery). */}
          {product.isPhone && product.condition !== "NEUF" && <GuideLinks locale={locale} />}
        </ProductVariantExperience>
      </div>

      {reviews && (
        <ReviewsSection summary={reviews} name={facts?.name ?? product.name} t={t} locale={locale} className="mt-20 sm:mt-28" />
      )}

      {related.length > 0 && (
        <section aria-labelledby="rayon" className="mt-20 sm:mt-28">
          <SectionHeading
            id="rayon"
            eyebrow={aisleName}
            title={inStock ? t.productPage.sameAisle : t.productPage.alsoSee}
            action={
              <Link
                href={`/collections/${product.category.slug}`}
                className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4"
              >
                {t.productPage.wholeAisle(aisleName)}
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

const GRADE_ORDER = ["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"];

/**
 * The listing's neighbours: the same storage in every grade, and the same
 * grade in every storage (with the RAM when it differs), one option each.
 */
function modelSiblings(listings: ModelListing[], slug: string) {
  const me = listings.find((l) => l.slug === slug);
  if (!me) return undefined;
  const pick = (group: ModelListing[]) =>
    group.find((l) => l.slug === slug) ?? group.find((l) => l.available) ?? group[0];

  const sameStorage = listings.filter((l) => l.storage === me.storage);
  const grades = GRADE_ORDER.flatMap((g) => {
    const group = sameStorage.filter((l) => l.grade === g);
    if (!group.length) return [];
    const l = pick(group);
    return [{ grade: g, slug: l.slug, available: l.available, current: l.slug === slug }];
  });

  const sameGrade = listings.filter((l) => l.grade === me.grade);
  const rams = new Set(sameGrade.map((l) => l.ram));
  const labelOf = (l: ModelListing) => [l.storage ?? "?", rams.size > 1 && l.ram ? `${l.ram} RAM` : null].filter(Boolean).join(" · ");
  const byLabel = new Map<string, ModelListing[]>();
  for (const l of sameGrade) byLabel.set(labelOf(l), [...(byLabel.get(labelOf(l)) ?? []), l]);
  const storages = [...byLabel].map(([label, group]) => {
    const l = pick(group);
    return { label, slug: l.slug, available: l.available, current: l.slug === slug };
  });

  return { grades, storages };
}
