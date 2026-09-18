import Link from "next/link";
import { getAllCategories } from "@/lib/db/categories";
import { getFeaturedProducts } from "@/lib/db/public-products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PhoneFinder } from "@/components/storefront/PhoneFinder";

export const revalidate = 60;

const REASSURANCE = [
  { icon: "🛡️", title: "Garantie incluse", desc: "Sur tous les téléphones bon occasion" },
  { icon: "🚚", title: "Livraison à Meknès", desc: "Paiement à la livraison" },
  { icon: "🔧", title: "Techniciens vérifiés", desc: "Diagnostic avant chaque vente" },
  { icon: "💬", title: "Support WhatsApp", desc: "Réponse rapide, sans robot" },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/10 bg-[#121212] px-4 py-24 text-center text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,146,42,0.25),_transparent_60%)]" />
        <div className="relative">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Le bon téléphone, <span className="text-[#c8922a]">au bon prix.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-neutral-300">
            Neufs, bon occasion et accessoires — vérifiés, garantis, à Meknès.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#trouver"
              className="rounded bg-[#c8922a] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
            >
              Trouver mon téléphone
            </a>
            <a
              href="https://wa.me/212667654430"
              className="rounded border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:border-[#c8922a]"
            >
              Nous écrire sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-neutral-50 px-4 py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-4">
          {REASSURANCE.map((item) => (
            <div key={item.title} className="text-center">
              <div className="text-2xl">{item.icon}</div>
              <p className="mt-1 text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trouver" className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">Trouvez votre téléphone</h2>
        <p className="mt-2 text-center text-neutral-600">
          3 questions rapides pour vous proposer les modèles qui correspondent.
        </p>
        <PhoneFinder />
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
        <h2 className="mb-4 text-xl font-semibold">Sélection du moment</h2>
        {featured.length === 0 ? (
          <p className="text-neutral-500">
            Le catalogue est en cours de mise en place — revenez bientôt.
          </p>
        ) : (
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
            {featured.map((product) => (
              <div key={product.id} className="w-[45%] flex-none snap-start sm:w-[30%] lg:w-[22%]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
