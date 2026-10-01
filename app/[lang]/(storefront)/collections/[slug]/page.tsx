import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import Link from "@/components/i18n/Link";
import { getProductsByCategorySlug, getCategoryFilterOptions } from "@/lib/db/public-products";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getAisles } from "@/lib/db/storefront";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogBar, type FilterValues } from "@/components/storefront/CatalogBar";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { Pagination } from "@/components/storefront/Pagination";
import { SearchTracker } from "@/components/analytics/SearchTracker";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnchorButton } from "@/components/ui/Button";
import { artFor } from "@/lib/category-art";
import { formatMAD } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { getLocale, getT } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/labels";
import { alternates } from "@/lib/i18n/seo";

// A 60s cache keeps pages fast; the ERP also asks for an immediate refresh
// (/api/revalidate) whenever stock or presentation changes.
export const revalidate = 60;

const PER_PAGE = 24;

// Next.js 16: both params and searchParams are Promises now.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<FilterValues>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Filtered views point to the aisle itself; later pages keep their own
  // URL so products past page 1 stay discoverable.
  const pageNo = Number((await searchParams).page);
  const path = `/collections/${slug}${Number.isInteger(pageNo) && pageNo > 1 ? `?page=${pageNo}` : ""}`;
  const [category, t, locale] = await Promise.all([getCategoryBySlug(slug), getT(), getLocale()]);
  if (!category) return {};
  const name = categoryName(t, slug, category.name);
  const blurb = t.aisleBlurb[slug] ?? null;
  const isPhones = slug === "telephones";
  const title = isPhones ? t.collection.metaPhonesTitle : t.collection.metaAisleTitle(name);
  const description = isPhones ? t.collection.metaPhonesDescription : t.collection.metaAisleDescription(name, blurb);
  const alt = alternates(locale, path);
  return {
    title,
    description,
    alternates: alt,
    openGraph: { title: `${title} | Electro Zaki`, description, url: alt.canonical },
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const filterParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [options, aisles, t] = await Promise.all([getCategoryFilterOptions(slug), getAisles(), getT()]);
  const phones = options.kind === "phones";
  const str = (v?: string) => (typeof v === "string" && v ? v.slice(0, 80) : undefined);
  const int = (v?: string) => (v && Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined);

  // Only the filters that belong to this kind of category are applied.
  const filters = {
    brand: str(filterParams.brand),
    q: str(filterParams.q),
    promo: filterParams.promo === "1" || undefined,
    maxPrice: int(filterParams.maxPrice),
    condition: phones ? str(filterParams.condition) : undefined,
    minBatteryHealth: phones ? int(filterParams.minBattery) : undefined,
    storage: phones ? str(filterParams.storage) : undefined,
    subcategory: phones ? undefined : str(filterParams.type),
    compatibleWith: phones ? undefined : str(filterParams.fits),
  };

  const all = await getProductsByCategorySlug(slug, filters);

  // Sorting and paging happen here: a whole aisle is at most a few hundred
  // rows, already fetched in one query for the filters above.
  const price = (p: (typeof all)[number]) => Number(p.recommendedSalePrice.toString());
  const sorted =
    filterParams.sort === "prix-asc"
      ? [...all].sort((a, b) => price(a) - price(b))
      : filterParams.sort === "prix-desc"
        ? [...all].sort((a, b) => price(b) - price(a))
        : all;
  const pageCount = Math.max(1, Math.ceil(sorted.length / PER_PAGE));
  const page = Math.min(pageCount, int(filterParams.page) ?? 1);
  const products = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Aisle chips: the children of a parent aisle, or a leaf's siblings.
  const groupSlug = category.parent?.slug ?? slug;
  const siblings = aisles.filter((a) => a.parentSlug === groupSlug);
  const current = aisles.find((a) => a.slug === slug);
  // How much stock there is stays private; what it costs is the useful part.
  const prices = (current ? [current] : siblings).map((a) => a.fromPrice).filter((p): p is number => p !== null);
  const fromPrice = prices.length ? Math.min(...prices) : null;
  const filtered = Object.values(filters).some(Boolean);
  const title = categoryName(t, slug, category.name);

  const crumbs = [
    { name: t.common.home, path: "/" },
    ...(category.parent
      ? [{ name: categoryName(t, category.parent.slug, category.parent.name), path: `/collections/${category.parent.slug}` }]
      : []),
    { name: title, path: `/collections/${slug}` },
  ];

  return (
    <div>
      <section className="border-b border-ink/10 bg-paper-2/60">
        <div className="mx-auto grid max-w-7xl items-end gap-6 px-4 pb-8 pt-8 sm:pt-10 md:grid-cols-[1fr_auto]">
          <div>
            <Breadcrumbs items={crumbs} />
            <h1 className="font-display mt-4 text-[2.4rem] font-extrabold leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 sm:text-lg">
              {phones ? t.collection.introPhones : t.collection.introAisle(t.aisleBlurb[slug] ?? null, title)}
            </p>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <DeviceArt kind={artFor(slug, category.name)} className="h-28 w-28 text-ink" />
            {fromPrice !== null && (
              <p className="text-end">
                <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
                  {t.common.fromLong}
                </span>
                <span className="readout mt-1 block text-5xl font-bold text-ink">{formatMAD(fromPrice)}</span>
              </p>
            )}
          </div>
        </div>

        {siblings.length > 1 && (
          <div className="mx-auto max-w-7xl px-4 pb-6">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none" aria-label={t.common.aisles}>
              {category.parent && (
                <li className="flex-none">
                  <Link
                    href={`/collections/${category.parent.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                  >
                    {t.collection.seeAll}
                  </Link>
                </li>
              )}
              {siblings.map((a) => {
                const on = a.slug === slug;
                return (
                  <li key={a.slug} className="flex-none">
                    <Link
                      href={`/collections/${a.slug}`}
                      aria-current={on ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full ps-1.5 pe-4 text-sm font-semibold transition-colors ${
                        on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                      }`}
                    >
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full ${on ? "bg-white/10" : "bg-paper"}`}>
                        <DeviceArt kind={artFor(a.slug, a.name)} className={`h-6 w-6 ${on ? "text-white" : "text-ink"}`} />
                      </span>
                      {categoryName(t, a.slug, a.name)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-8 sm:pb-10">
        {filters.q && <SearchTracker query={filters.q} results={all.length} />}

        <CatalogBar options={options} basePath={`/collections/${slug}`} defaults={filterParams} />

        <div className="pt-6 sm:pt-8">
          <div>
            {pageCount > 1 && (
              <p className="sr-only" aria-live="polite">
                {t.pagination.pageOf(page, pageCount)}
              </p>
            )}
            {products.length === 0 ? (
              <div className="flex flex-col items-center rounded-[1.75rem] border border-dashed border-ink/20 bg-white px-6 py-14 text-center">
                <DeviceArt kind={artFor(slug, category.name)} className="h-24 w-24 text-neutral-400" />
                <p className="font-display mt-4 text-2xl font-bold text-ink">
                  {filtered ? t.collection.emptyFilteredTitle : t.collection.emptyTitle}
                </p>
                <p className="mt-2 max-w-md text-neutral-600">
                  {filtered ? t.collection.emptyFilteredText : t.collection.emptyText}
                </p>
                <AnchorButton
                  href={whatsappLink(t.collection.waLookingFor(title, filters.q))}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="whatsapp"
                  className="mt-6"
                >
                  <MessageCircle size={18} aria-hidden /> {t.collection.askWhatsapp}
                </AnchorButton>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i < 4} />
                ))}
              </div>
            )}
            <Pagination
              page={page}
              pageCount={pageCount}
              basePath={`/collections/${slug}`}
              params={filterParams as Record<string, string | undefined>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
