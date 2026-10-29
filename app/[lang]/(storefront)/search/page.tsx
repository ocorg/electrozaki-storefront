import { redirect } from "next/navigation";
import { countShopOnlyAccessories, searchProducts, shorterQueries } from "@/lib/db/public-products";
import { NoExactMatch } from "@/components/storefront/NoExactMatch";
import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SearchTracker } from "@/components/analytics/SearchTracker";
import { PHONES_AISLE, TABLETS_AISLE, WHATSAPP_URL } from "@/lib/site";
import { getLocalePath, getT } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/labels";

const ACCESSORIES_AISLE = "accessoires";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.searchPage.metaTitle, robots: { index: false, follow: true } };
}

// Next.js 16: searchParams is also a Promise, same as params.
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// One short text per parameter: a repeated one (?q=a&q=b) arrives as a list.
const one = (v: string | string[] | undefined, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = one(params.q, 60) ?? "";
  const price = Number(one(params.maxPrice, 9));

  const filters = {
    maxPrice: Number.isFinite(price) && price > 0 ? price : undefined,
    brand: one(params.brand, 40),
    tag: one(params.tag, 40),
  };
  const hasFilters = Boolean(filters.maxPrice || filters.brand || filters.tag);

  const [results, t, withLocale] = await Promise.all([
    query || hasFilters ? searchProducts(query, filters) : Promise.resolve([]),
    getT(),
    getLocalePath(),
  ]);
  const s = t.searchPage;

  // Nothing found: the closest phones in stock (the same search with its
  // last words dropped), or else accessories sold in the shop only.
  let closest: { query: string; products: typeof results } | null = null;
  let shopOnly = false;
  if (query && results.length === 0) {
    for (const shorter of shorterQueries(query)) {
      const found = await searchProducts(shorter, filters);
      if (found.length) {
        closest = { query: shorter, products: found.slice(0, 8) };
        break;
      }
    }
    if (!closest) shopOnly = (await countShopOnlyAccessories(query)) > 0;
  }

  // The aisles have the filters (grade, battery, storage, price, promo,
  // sort) and search as you type: a search whose results all sit in one
  // aisle opens that aisle, searched; a mixed one offers each aisle.
  const aisleOf = (p: (typeof results)[number]) =>
    p.category.slug === TABLETS_AISLE ? TABLETS_AISLE : p.isPhone ? PHONES_AISLE : ACCESSORIES_AISLE;
  const counts = new Map<string, number>();
  for (const p of results) counts.set(aisleOf(p), (counts.get(aisleOf(p)) ?? 0) + 1);
  const aisleHref = (aisle: string) => `/collections/${aisle}?q=${encodeURIComponent(query)}`;
  if (query && !hasFilters && counts.size === 1) redirect(withLocale(aisleHref([...counts.keys()][0])));

  const title = query ? s.resultsFor(query) : hasFilters ? s.suggestions : s.search;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">{title}</h1>
      {query && <SearchTracker query={query} results={results.length} />}

      {query && counts.size > 1 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-600">{s.refine}</span>
          {[...counts].map(([aisle, n]) => (
            <Link
              key={aisle}
              href={aisleHref(aisle)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 transition-colors hover:ring-ink/30"
            >
              {categoryName(t, aisle, aisle)} <span className="readout text-neutral-500">({n})</span>
            </Link>
          ))}
        </div>
      )}

      {!query && !hasFilters ? (
        <p className="text-neutral-600">{s.useBar}</p>
      ) : results.length === 0 && query ? (
        <>
          <NoExactMatch query={query} closest={closest?.query ?? null} shopOnly={shopOnly} t={t} />
          {closest && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {closest.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      ) : results.length === 0 ? (
        <p className="text-neutral-600">
          {s.noneBefore}{" "}
          <a href={WHATSAPP_URL} className="font-semibold text-neutral-900 underline decoration-whatsapp decoration-2 underline-offset-2">
            {s.contactWhatsapp}
          </a>
          .
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
