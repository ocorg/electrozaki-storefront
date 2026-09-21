import { listBundles } from "@/lib/db/bundles";
import { listAdminProducts } from "@/lib/db/admin-products";
import { BundlesManager } from "./BundlesManager";

export default async function AdminBundlesPage() {
  const [bundles, products] = await Promise.all([listBundles(), listAdminProducts()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Bundles</h1>
      <p className="mt-1 text-neutral-600">
        Packs de produits vendus ensemble à un prix combiné, affichés sur la fiche produit.
      </p>
      <BundlesManager
        bundles={bundles.map((b) => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          bundlePrice: b.bundlePrice.toString(),
          active: b.active,
          items: b.items.map((i) => ({ productName: i.product.name, quantity: i.quantity })),
        }))}
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.recommendedSalePrice),
        }))}
      />
    </div>
  );
}
