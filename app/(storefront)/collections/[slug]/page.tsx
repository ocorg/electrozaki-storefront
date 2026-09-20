import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getProductsByCategorySlug,
  getDistinctBrandsForCategory,
} from "@/lib/db/public-products";
import { getCategoryBySlug } from "@/lib/db/categories";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogFilters } from "@/components/storefront/CatalogFilters";

// Catalog changes rarely (staff add products by hand) — a 60s cache keeps
// pages fast without needing to hand-manage cache invalidation for v1.
export const revalidate = 60;

// Next.js 16: both params and searchParams are Promises now.
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    brand?: string;
    condition?: string;
    minBattery?: string;
    maxPrice?: string;
  }>;
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

  const filters = {
    brand: filterParams.brand || undefined,
    condition: filterParams.condition || undefined,
    minBatteryHealth: filterParams.minBattery ? Number(filterParams.minBattery) : undefined,
    maxPrice: filterParams.maxPrice ? Number(filterParams.maxPrice) : undefined,
  };

  const [products, brands] = await Promise.all([
    getProductsByCategorySlug(slug, filters),
    getDistinctBrandsForCategory(slug),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold sm:text-3xl">{category.name}</h1>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside>
          <CatalogFilters
            brands={brands}
            basePath={`/collections/${slug}`}
            defaults={{
              brand: filterParams.brand,
              condition: filterParams.condition,
              minBattery: filterParams.minBattery,
              maxPrice: filterParams.maxPrice,
            }}
          />
        </aside>

        <div>
          {products.length === 0 ? (
            <p className="text-neutral-500">
              Aucun résultat pour ces filtres. Contactez-nous sur WhatsApp pour toute demande.
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
