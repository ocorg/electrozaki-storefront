import Link from "next/link";
import { MessageCircle, ShieldCheck, Smartphone, Truck, Wrench } from "lucide-react";
import { getAllCategories } from "@/lib/db/categories";
import { getFeaturedProducts } from "@/lib/db/public-products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PhoneFinder } from "@/components/storefront/PhoneFinder";
import { AnchorButton } from "@/components/ui/Button";
import { interactiveCardClasses } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";

export const revalidate = 60;

const REASSURANCE = [
  { icon: ShieldCheck, title: "Garantie incluse", desc: "Sur tous les téléphones bon occasion" },
  { icon: Truck, title: "Livraison à Meknès", desc: "Paiement à la livraison" },
  { icon: Wrench, title: "Techniciens vérifiés", desc: "Diagnostic avant chaque vente" },
  { icon: MessageCircle, title: "Support WhatsApp", desc: "Réponse rapide, sans robot" },
];

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getAllCategories(),
    getFeaturedProducts(8),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-black/10 bg-ink px-4 py-20 text-center text-white sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,146,42,0.25),_transparent_60%)]" />
        <div className="relative">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Le bon téléphone, <span className="text-gold">au bon prix.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-300">
            Neufs, bon occasion et accessoires — vérifiés, garantis, à Meknès.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <AnchorButton href="#trouver" variant="accent">
              Trouver mon téléphone
            </AnchorButton>
            <a
              href="https://wa.me/212667654430"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:border-gold"
            >
              Nous écrire sur WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-black/10 bg-neutral-50 px-4 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {REASSURANCE.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <IconTile icon={item.icon} size={48} />
              <p className="mt-2.5 text-sm font-semibold">{item.title}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="trouver" className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">Trouvez votre téléphone</h2>
        <p className="mt-2 text-center text-neutral-600">
          3 questions rapides pour vous proposer les modèles qui correspondent.
        </p>
        <PhoneFinder />
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-6 text-2xl font-bold">Catégories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className={interactiveCardClasses("flex flex-col items-center gap-3 px-4 py-7 text-center")}
              >
                <IconTile icon={Smartphone} tone="gold" size={40} />
                <span className="font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-6 text-2xl font-bold">Sélection du moment</h2>
        {featured.length === 0 ? (
          <div className="rounded-xl border border-black/10 bg-neutral-50 p-8 text-center">
            <p className="text-neutral-600">
              Notre catalogue en ligne est en cours de mise à jour, mais nos téléphones et
              accessoires sont disponibles dès maintenant en boutique et sur WhatsApp.
            </p>
            <AnchorButton href="https://wa.me/212667654430" className="mt-4">
              Voir les disponibilités sur WhatsApp
            </AnchorButton>
          </div>
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
