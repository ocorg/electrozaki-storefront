import { searchProducts } from "@/lib/db/public-products";
import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/ProductCard";
import { SearchTracker } from "@/components/analytics/SearchTracker";
import { WHATSAPP_URL } from "@/lib/site";
import { getT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.searchPage.metaTitle, robots: { index: false, follow: true } };
}

// Next.js 16: searchParams is also a Promise, same as params.
type Props = {
  searchParams: Promise<{ q?: string; maxPrice?: string; brand?: string; tag?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, maxPrice, brand, tag } = await searchParams;
  const query = q?.trim() ?? "";

  const filters = {
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    brand: brand || undefined,
    tag: tag || undefined,
  };
  const hasFilters = Boolean(filters.maxPrice || filters.brand || filters.tag);

  const [results, t] = await Promise.all([
    query || hasFilters ? searchProducts(query, filters) : Promise.resolve([]),
    getT(),
  ]);
  const s = t.searchPage;

  const title = query ? s.resultsFor(query) : hasFilters ? s.suggestions : s.search;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">{title}</h1>
      {query && <SearchTracker query={query} results={results.length} />}

      {!query && !hasFilters ? (
        <p className="text-neutral-600">{s.useBar}</p>
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
