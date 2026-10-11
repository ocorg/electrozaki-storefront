import { prisma } from "./client";
import { RESERVED_KEYS, type FacetGroup } from "@/lib/facets";

// The checklist groups staff attached to this aisle (or to its parent
// aisle) in the ERP, with their options, in the ERP's order.
export async function getFacetGroups(categorySlug: string): Promise<FacetGroup[]> {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, parentId: true },
  });
  if (!category) return [];
  const categoryIds = category.parentId ? [category.id, category.parentId] : [category.id];

  const groups = await prisma.facetGroup.findMany({
    where: { active: true, categories: { some: { categoryId: { in: categoryIds } } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      key: true,
      name: true,
      question: true,
      display: true,
      options: {
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { key: true, name: true, level: true },
      },
    },
  });
  return groups.filter((g) => g.options.length > 0 && !RESERVED_KEYS.has(g.key));
}
