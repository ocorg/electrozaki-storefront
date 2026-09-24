import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductsByCategorySlug, getCategoryFilterOptions } from "@/lib/db/public-products";
import { getCategoryBySlug } from "@/lib/db/categories";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogFilters, type FilterValues } from "@/components/storefront/CatalogFilters";

// A 60s cache keeps pages fast; the ERP also asks for an immediate refresh
// (/api/revalidate) whenever stock or presentation changes.
export const revalidate = 60;

// Next.js 16: both params and searchParams are Promises now.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<FilterValues>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Electro Zaki`,
    description: `Découvrez notre sélection ${category.name.toLowerCase()} chez Electro Zaki, Meknès.`,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const filterParams = await searchParams;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const options = await getCategoryFilterOptions(slug);
  const phones = options.kind === "phones";
  const str = (v?: string) => (typeof v === "string" && v ? v.slice(0, 80) : undefined);
  const int = (v?: string) => (v && Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : undefined);

  // Only the filters that belong to this kind of category are applied.
  const filters = {
    brand: str(filterParams.brand),
    q: str(filterParams.q),
    maxPrice: int(filterParams.maxPrice),
    condition: phones ? str(filterParams.condition) : undefined,
    minBatteryHealth: phones ? int(filterParams.minBattery) : undefined,
    storage: phones ? str(filterParams.storage) : undefined,
    subcategory: phones ? undefined : str(filterParams.type),
    compatibleWith: phones ? undefined : str(filterParams.fits),
  };

  const products = await getProductsByCategorySlug(slug, filters);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">{category.name}</h1>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <CatalogFilters options={options} basePath={`/collections/${slug}`} defaults={filterParams} />
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="text-neutral-500">
              {Object.values(filters).some(Boolean)
                ? "Aucun résultat pour ces filtres. Contactez-nous sur WhatsApp pour toute demande."
                : "Nouveaux articles bientôt en ligne — contactez-nous sur WhatsApp pour connaître le stock en magasin."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
