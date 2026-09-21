import { Plus } from "lucide-react";
import { listAdminProducts } from "@/lib/db/admin-products";
import { CONDITION_LABEL } from "@/lib/conditions";
import { LinkButton } from "@/components/ui/Button";
import { ProductSearchFilter } from "./ProductSearchFilter";

const AVAILABILITY_LABEL: Record<string, string> = {
  IN_STOCK: "En stock",
  OUT_OF_STOCK: "Épuisé",
  COMING_SOON: "Bientôt",
  DISCONTINUED: "Discontinué",
};

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produits</h1>
          <p className="mt-1 text-neutral-600">{products.length} produits au catalogue.</p>
        </div>
        <LinkButton href="/admin/products/new">
          <Plus size={18} /> Nouveau produit
        </LinkButton>
      </div>

      <ProductSearchFilter
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand,
          imageUrl: p.images[0]?.url ?? null,
          categoryName: p.category.name,
          price: p.recommendedSalePrice.toString(),
          compareAtPrice: p.compareAtPrice?.toString() ?? null,
          stock: p.internal?.stockQuantity ?? 0,
          availability: p.availability,
          condition: p.condition,
        }))}
        availabilityLabels={AVAILABILITY_LABEL}
        conditionLabels={CONDITION_LABEL}
      />
    </div>
  );
}
