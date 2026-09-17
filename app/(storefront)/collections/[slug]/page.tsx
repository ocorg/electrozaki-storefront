import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/db/categories";
import { getProductsByCategorySlug } from "@/lib/db/public-products";
import { ProductCard } from "@/components/storefront/ProductCard";

// Catalog changes rarely (staff add products by hand) — a 60s cache keeps
// pages fast without needing to hand-manage cache invalidation for v1.
export const revalidate = 60;

// Next.js 16: `params` is a Promise and must be awaited — this is not
// optional the way it briefly was under Next.js 15's compatibility shim.
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} — Electro Zaki`,
    description: `Découvrez notre sélection ${category.name.toLowerCase()} chez Electro Zaki, Meknès.`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategorySlug(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">{category.name}</h1>

      {products.length === 0 ? (
        <p className="text-neutral-500">
          Cette catégorie sera bientôt disponible. Contactez-nous sur WhatsApp
          pour toute demande.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
