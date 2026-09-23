import { prisma } from "./client";

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      parent: { select: { name: true, slug: true } },
    },
  });
}

// Top-level categories with their children, for nav menus and the home page.
export async function getAllCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        select: { id: true, name: true, slug: true },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

// Leaf categories only (no children) — every product actually lives in one
// of these, never in a parent like "Accessoires" itself. Used for the
// homepage's "shop by category" grid so every tile lands on a page with
// real products, instead of listing parent categories that are empty.
export async function getBrowsableCategories() {
  const categories = await prisma.category.findMany({
    where: { children: { none: {} } },
    select: {
      id: true,
      name: true,
      slug: true,
      sortOrder: true,
      parent: { select: { sortOrder: true } },
    },
  });

  // Sort by the top-level group's sortOrder first (a top-level leaf like
  // "Téléphones" ranks by its own sortOrder), then by position within that
  // group. Ordering by `parentId` in SQL doesn't work here — Postgres sorts
  // NULL (every top-level category's parentId) last in ascending order by
  // default, which would push "Téléphones" after every accessory
  // subcategory instead of respecting sortOrder.
  return categories
    .sort((a: (typeof categories)[number], b: (typeof categories)[number]) => {
      const groupA = a.parent?.sortOrder ?? a.sortOrder;
      const groupB = b.parent?.sortOrder ?? b.sortOrder;
      return groupA !== groupB ? groupA - groupB : a.sortOrder - b.sortOrder;
    })
    .map(({ id, name, slug }: (typeof categories)[number]) => ({ id, name, slug }));
}
