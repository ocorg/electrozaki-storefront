import { searchProducts } from "@/lib/db/public-products";
import { ProductCard } from "@/components/storefront/ProductCard";

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

  const results = query || hasFilters ? await searchProducts(query, filters) : [];

  const title = query
    ? `Résultats pour « ${query} »`
    : hasFilters
      ? "Nos suggestions pour vous"
      : "Rechercher";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">{title}</h1>

      {!query && !hasFilters ? (
        <p className="text-neutral-500">Utilisez la barre de recherche pour trouver un produit.</p>
      ) : results.length === 0 ? (
        <p className="text-neutral-500">
          Aucun résultat. Essayez un autre terme, ou{" "}
          <a href="https://wa.me/212667654430" className="font-medium text-neutral-900 underline decoration-[#c8922a] decoration-2 underline-offset-2">
            contactez-nous sur WhatsApp
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
