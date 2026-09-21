import { listAdminCategories } from "@/lib/db/categories";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await listAdminCategories();
  const options = categories
    .filter((c) => c._count.children === 0) // products only ever live on a leaf category
    .map((c) => ({ id: c.id, name: c.parent ? `${c.parent.name} > ${c.name}` : c.name }));

  return (
    <div>
      <h1 className="text-2xl font-bold">Nouveau produit</h1>
      <div className="mt-6 max-w-3xl">
        <ProductForm categories={options} />
      </div>
    </div>
  );
}
