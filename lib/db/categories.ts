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
