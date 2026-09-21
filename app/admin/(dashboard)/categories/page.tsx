import { listAdminCategories, getAllCategories } from "@/lib/db/categories";
import { CategoriesManager } from "./CategoriesManager";

export default async function AdminCategoriesPage() {
  const [categories, topLevel] = await Promise.all([listAdminCategories(), getAllCategories()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Catégories</h1>
      <p className="mt-1 text-neutral-600">
        Gérez l&apos;arborescence du catalogue. Une catégorie ne peut être supprimée que si elle
        n&apos;a plus de produits ni de sous-catégories.
      </p>
      <CategoriesManager
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          sortOrder: c.sortOrder,
          parentId: c.parentId,
          parentName: c.parent?.name ?? null,
          productCount: c._count.products,
          childCount: c._count.children,
        }))}
        topLevel={topLevel.map((c) => ({ id: c.id, name: c.name }))}
      />
    </div>
  );
}
