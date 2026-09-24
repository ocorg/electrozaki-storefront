import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

// ─────────────────────────────────────────────────────────────────────────
// THIS IS THE FILE deliverable 1's schema comment pointed to.
// Every page under app/(storefront) that needs product data imports FROM
// HERE — never `prisma.product.findMany(...)` directly in a page file.
// PUBLIC_PRODUCT_SELECT below is an explicit whitelist: it can never
// accidentally return `internal` (purchase price, supplier, stock count)
// because that relation is simply never named in the select.
// ─────────────────────────────────────────────────────────────────────────

const PUBLIC_PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  brand: true,
  condition: true,
  isPhone: true,
  description: true,
  specs: true,
  recommendedSalePrice: true,
  compareAtPrice: true,
  availability: true,
  tags: true,
  batteryHealthPercent: true,
  faceIdWorking: true,
  screenGenuine: true,
  batteryGenuine: true,
  cameraGenuine: true,
  chargingPortGenuine: true,
  speakerGenuine: true,
  hasDefects: true,
  transparencyNotes: true,
  metaTitle: true,
  metaDescription: true,
  category: { select: { id: true, name: true, slug: true } },
  images: {
    select: { url: true, altText: true, sortOrder: true },
    orderBy: { sortOrder: "asc" as const },
  },
  variants: {
    select: {
      id: true,
      name: true,
      priceOverride: true,
      skuOrRef: true,
      color: true,
      storageLabel: true,
      imageUrl: true,
      stockQuantity: true,
      batteryHealthPercent: true,
      faceIdWorking: true,
      screenGenuine: true,
      batteryGenuine: true,
      cameraGenuine: true,
      chargingPortGenuine: true,
      speakerGenuine: true,
      hasDefects: true,
      transparencyNotes: true,
    },
  },
  // Phase-2: for a phone, its gift-eligible accessory choices; for an
  // accessory, this is empty (compatibility runs the other direction below).
  compatibleAccessories: {
    where: { product: { published: true } },
    select: {
      isGiftOption: true,
      product: {
        select: {
          id: true,
          slug: true,
          name: true,
          category: { select: { name: true } },
          images: { select: { url: true }, orderBy: { sortOrder: "asc" as const }, take: 1 },
        },
      },
    },
  },
  // Phase-2: for an accessory, the phone models it's confirmed to fit.
  compatibleWithPhones: {
    where: { compatibleWith: { published: true } },
    select: {
      compatibleWith: { select: { id: true, slug: true, name: true } },
    },
  },
} as const;

// Hand-written to match PUBLIC_PRODUCT_SELECT, rather than derived through
// Prisma's Prisma.ProductGetPayload<...> generic. Prisma 7's newer generator
// moved that generic machinery to a different internal path than the one
// documented for the classic generator, and it's not worth re-coupling this
// file to wherever it lives this version — a plain interface here is exactly
// as type-safe for our own code and doesn't break the next time Prisma
// reorganizes its internals.
export interface PublicProduct {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  condition: string;
  isPhone: boolean;
  description: string | null;
  specs: unknown;
  recommendedSalePrice: { toString(): string };
  compareAtPrice: { toString(): string } | null;
  availability: AvailabilityStatus;
  tags: string[];
  batteryHealthPercent: number | null;
  faceIdWorking: boolean | null;
  screenGenuine: boolean | null;
  batteryGenuine: boolean | null;
  cameraGenuine: boolean | null;
  chargingPortGenuine: boolean | null;
  speakerGenuine: boolean | null;
  hasDefects: boolean;
  transparencyNotes: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  category: { id: string; name: string; slug: string };
  images: { url: string; altText: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    priceOverride: { toString(): string } | null;
    skuOrRef: string | null;
    color: string | null;
    storageLabel: string | null;
    imageUrl: string | null;
    stockQuantity: number;
    batteryHealthPercent: number | null;
    faceIdWorking: boolean | null;
    screenGenuine: boolean | null;
    batteryGenuine: boolean | null;
    cameraGenuine: boolean | null;
    chargingPortGenuine: boolean | null;
    speakerGenuine: boolean | null;
    hasDefects: boolean;
    transparencyNotes: string | null;
  }[];
  compatibleAccessories: {
    isGiftOption: boolean;
    product: {
      id: string;
      slug: string;
      name: string;
      category: { name: string };
      images: { url: string }[];
    };
  }[];
  compatibleWithPhones: {
    compatibleWith: { id: string; slug: string; name: string };
  }[];
}

export type ProductFilters = {
  maxPrice?: number;
  brand?: string;
  tag?: string;
  condition?: string;
  minBatteryHealth?: number;
  storage?: string; // e.g. "128GB" (phones)
  subcategory?: string; // child category slug (accessories)
  compatibleWith?: string; // phone modelKey (accessories)
  q?: string; // words to find in the name, brand or category (search box)
};

function buildFilterConditions(filters?: ProductFilters): Array<Record<string, unknown>> {
  const and: Array<Record<string, unknown>> = [];
  if (filters?.maxPrice) and.push({ recommendedSalePrice: { lte: filters.maxPrice } });
  if (filters?.brand) and.push({ brand: { contains: filters.brand, mode: "insensitive" } });
  if (filters?.tag) and.push({ tags: { has: filters.tag } });
  if (filters?.condition) and.push({ condition: filters.condition });
  if (filters?.minBatteryHealth) {
    // Synced phones carry battery per unit (variant); hand-made ones on the product.
    and.push({
      OR: [
        { batteryHealthPercent: { gte: filters.minBatteryHealth } },
        { variants: { some: { batteryHealthPercent: { gte: filters.minBatteryHealth }, stockQuantity: { gt: 0 } } } },
      ],
    });
  }
  if (filters?.storage) and.push({ tags: { has: filters.storage.toLowerCase() } });
  // Every word must appear somewhere: "coque 13" finds "Coque iPhone 13".
  for (const word of (filters?.q ?? "").trim().split(/\s+/).filter((w) => w.length > 0).slice(0, 6)) {
    and.push({
      OR: [
        { name: { contains: word, mode: "insensitive" } },
        { brand: { contains: word, mode: "insensitive" } },
        { category: { name: { contains: word, mode: "insensitive" } } },
      ],
    });
  }
  if (filters?.subcategory) and.push({ category: { slug: filters.subcategory } });
  if (filters?.compatibleWith) {
    and.push({ compatibleWithPhones: { some: { compatibleWith: { modelKey: filters.compatibleWith, published: true } } } });
  }
  return and;
}

export async function getProductBySlug(slug: string): Promise<PublicProduct | null> {
  return prisma.product.findFirst({
    where: { slug, published: true },
    select: PUBLIC_PRODUCT_SELECT,
  });
}

// A category page can be visited at a leaf (e.g. "chargeurs") or at a
// parent that groups several leaves (e.g. "accessoires"). Products only
// ever live on a leaf category, so a parent's page needs to pull in all of
// its children's products too, or it would always render empty.
async function resolveCategoryIds(categorySlug: string): Promise<string[]> {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, children: { select: { id: true } } },
  });
  if (!category) return [];
  return [category.id, ...category.children.map((c: { id: string }) => c.id)];
}

export async function getProductsByCategorySlug(
  categorySlug: string,
  filters?: ProductFilters
): Promise<PublicProduct[]> {
  const categoryIds = await resolveCategoryIds(categorySlug);
  const and: Array<Record<string, unknown>> = [
    { categoryId: { in: categoryIds } },
    { published: true },
    { availability: { not: AvailabilityStatus.DISCONTINUED } },
    ...buildFilterConditions(filters),
  ];

  return prisma.product.findMany({
    where: { AND: and },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

// Powers the sidebar's brand dropdown with brands that actually exist in
// this category right now, instead of a hardcoded list that drifts from
// the real catalog.
export async function getDistinctBrandsForCategory(categorySlug: string): Promise<string[]> {
  const categoryIds = await resolveCategoryIds(categorySlug);
  const rows = await prisma.product.findMany({
    where: { categoryId: { in: categoryIds }, published: true, brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
  });
  return rows
    .map((r: { brand: string | null }) => r.brand)
    .filter((b: string | null): b is string => Boolean(b))
    .sort();
}

// `query` and `filters` are independent — the header search bar uses query
// alone, the homepage phone-finder uses filters alone, and either can
// combine both. At least one of the two must be present or this returns
// nothing, so a bare `/search` visit doesn't dump the whole catalog.
export async function searchProducts(
  query: string,
  filters?: ProductFilters
): Promise<PublicProduct[]> {
  const q = query.trim();
  const filterConditions = buildFilterConditions(filters);
  if (!q && filterConditions.length === 0) return [];

  const and: Array<Record<string, unknown>> = [
    { published: true },
    { availability: { not: AvailabilityStatus.DISCONTINUED } },
    ...filterConditions,
  ];

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
      ],
    });
  }

  return prisma.product.findMany({
    where: { AND: and },
    select: PUBLIC_PRODUCT_SELECT,
    take: 30,
  });
}

export async function getFeaturedProducts(limit = 8): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: { availability: AvailabilityStatus.IN_STOCK, published: true },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export type CategoryFilterOptions = {
  kind: "phones" | "accessories";
  brands: string[];
  storages: string[];
  subcategories: { slug: string; name: string }[];
  phoneModels: { key: string; name: string }[];
};

const STORAGE_RE = /^\d+(gb|tb)$/;
const storageSize = (s: string) => parseInt(s, 10) * (s.endsWith("tb") ? 1024 : 1);

// What the sidebar can offer for this category, taken from what's actually
// on sale in it — phone filters for phones, accessory filters for the rest.
export async function getCategoryFilterOptions(categorySlug: string): Promise<CategoryFilterOptions> {
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
    select: { id: true, children: { select: { id: true, slug: true, name: true }, orderBy: { sortOrder: "asc" } } },
  });
  if (!category) return { kind: "accessories", brands: [], storages: [], subcategories: [], phoneModels: [] };
  const ids = [category.id, ...category.children.map((c) => c.id)];

  const products = await prisma.product.findMany({
    where: { categoryId: { in: ids }, published: true, availability: { not: AvailabilityStatus.DISCONTINUED } },
    select: { isPhone: true, brand: true, tags: true, categoryId: true },
  });
  const phones = products.filter((p) => p.isPhone).length;
  const kind = phones > 0 && phones >= products.length / 2 ? "phones" : "accessories";
  const brands = [...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))].sort((a, b) =>
    a.localeCompare(b)
  );

  if (kind === "phones") {
    const storages = [...new Set(products.flatMap((p) => p.tags.filter((t) => STORAGE_RE.test(t))))]
      .sort((a, b) => storageSize(a) - storageSize(b))
      .map((t) => t.toUpperCase());
    return { kind, brands, storages, subcategories: [], phoneModels: [] };
  }

  const used = new Set(products.map((p) => p.categoryId));
  const subcategories = category.children.filter((c) => used.has(c.id)).map(({ slug, name }) => ({ slug, name }));

  // Phone models that at least one accessory here is confirmed to fit.
  const links = await prisma.productCompatibility.findMany({
    where: { product: { categoryId: { in: ids }, published: true }, compatibleWith: { published: true } },
    select: { compatibleWith: { select: { modelKey: true, name: true, tags: true } } },
  });
  const models = new Map<string, string>();
  for (const { compatibleWith: phone } of links) {
    if (!phone.modelKey || models.has(phone.modelKey)) continue;
    // "iPhone 13 128GB" → "iPhone 13"
    const storage = phone.tags.find((t) => STORAGE_RE.test(t));
    const cut = storage ? phone.name.toLowerCase().lastIndexOf(storage) : -1;
    const name = cut > 0 ? phone.name.slice(0, cut).trim() : phone.name;
    models.set(phone.modelKey, name);
  }
  const phoneModels = [...models].map(([key, name]) => ({ key, name })).sort((a, b) => a.name.localeCompare(b.name));
  return { kind, brands, storages: [], subcategories, phoneModels };
}
