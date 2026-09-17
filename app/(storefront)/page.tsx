import Link from "next/link";
import { getAllCategories } from "@/lib/db/categories";
import { getFeaturedProducts } from "@/lib/db/public-products";
import { ProductCard } from "@/components/storefront/ProductCard";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div>
      <section className="border-b border-black/10 bg-black px-4 py-16 text-center text-white">
        <h1 className="text-3xl font-semibold">Electro Zaki</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-300">
          Téléphones neufs et reconditionnés, accessoires, et réparation à
          Meknès. Commandez directement sur WhatsApp.
        </p>
        <a
          href="https://wa.me/212667654430"
          className="mt-6 inline-block rounded bg-[#c8922a] px-6 py-3 font-medium text-black"
        >
          Nous contacter sur WhatsApp
        </a>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="mb-4 text-xl font-semibold">Catégories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="rounded-lg border border-black/10 px-4 py-6 text-center font-medium transition-colors hover:border-[#c8922a]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-4 text-xl font-semibold">En vedette</h2>
        {featured.length === 0 ? (
          <p className="text-neutral-500">
            Le catalogue est en cours de mise en place — revenez bientôt.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
