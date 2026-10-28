import { AvailabilityStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";
import { ACCESSORIES_OPEN, OPEN_PRODUCTS } from "@/lib/site";

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
  modelKey: true,
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
  colorName: true,
  colorGroup: true,
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
      compareAtPrice: true,
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
          category: { select: { name: true, slug: true } },
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
  // The checklist staff ticked in the ERP (style, protection, phone model…).
  facets: {
    where: { option: { active: true, group: { active: true } } },
    select: {
      imageUrl: true,
      option: { select: { key: true, name: true, level: true, sortOrder: true, group: { select: { key: true } } } },
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
  modelKey: string | null;
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
  colorName: string | null;
  colorGroup: string | null;
  category: { id: string; name: string; slug: string };
  images: { url: string; altText: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    priceOverride: { toString(): string } | null;
    compareAtPrice: { toString(): string } | null;
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
      category: { name: string; slug: string };
      images: { url: string }[];
    };
  }[];
  compatibleWithPhones: {
    compatibleWith: { id: string; slug: string; name: string };
  }[];
  facets: {
    imageUrl: string | null;
    option: { key: string; name: string; level: number | null; sortOrder: number; group: { key: string } };
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
  promo?: boolean; // only products (or units) with a promo price
};

// On promo: a "was" price on the product, or on a unit still in stock.
const ON_PROMO = {
  OR: [
    { compareAtPrice: { not: null } },
    { variants: { some: { compareAtPrice: { not: null }, stockQuantity: { gt: 0 } } } },
  ],
};

// How customers also write the brands and models: in Arabic letters, and a
// few common typos. Turned into the catalogue's words before searching.
const ALIASES: [RegExp, string][] = [
  [/[آأإا]يفون|[آا]يفن/g, " iphone "],
  [/\b(?:ipone|iphon(?!e)|ifone|aifon|ayfon|aiphone)/g, " iphone "],
  [/سامسون[جغكگ]|سامسنج/g, " samsung "],
  [/\b(?:samsong|samsumg|samsun(?!g))/g, " samsung "],
  [/[جغكگ]ا?لا?كسي/g, " galaxy "],
  [/ش[يا]?اومي|شومي/g, " xiaomi "],
  [/ريدمي|ردمي/g, " redmi "],
  [/هونو?ر/g, " honor "],
  [/[اأ]لترا/g, " ultra "],
  [/برو/g, " pro "],
  [/ماكس/g, " max "],
  [/بلس/g, " plus "],
  [/نوت/g, " note "],
  // "S23+" is how Samsung (and the ERP) write "S23 Plus".
  [/\+/g, " plus "],
  [/\b0ro\b/g, " pro "],
  // The shop's own words for accessories: cases are "pochettes", tempered
  // glass is "incassable".
  [/\b(?:coques?|covers?|cases?)\b|غلاف|كوك/g, " pochette "],
  [/\bverres?(?: tremp[eé]s?)?(?![a-z])|\bglass\b/g, " incassable "],
  [/عادي|العادي|نورمال/g, " "],
];
// Words that say "the base model" ("iPhone 13 normal", as on the ads):
// no listing contains them, so they would make the search find nothing.
const FILLER_WORDS = new Set(["normal", "normale", "simple", "standard", "classique"]);
const ARABIC_DIGITS = /[٠-٩۰-۹]/g;

/**
 * What a customer types, as words: lower-case, accents removed, letters and
 * digits split ("iPhone13" → "iphone 13"), 6 words at most.
 */
export function searchWords(q: string | null | undefined): string[] {
  let text = (q ?? "").toLowerCase().replace(ARABIC_DIGITS, (d) => String((d.charCodeAt(0) & 0xf) % 10));
  for (const [re, word] of ALIASES) text = text.replace(re, word);
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // "iphone13" → "iphone 13", "13pro" → "13 pro"; model codes ("a16", "s23")
    // and sizes ("256gb", "5g") stay whole
    .replace(/([a-z]{3,})(\d)/g, "$1 $2")
    .replace(/(\d)([a-z]{3,})/g, "$1 $2")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 0 && !FILLER_WORDS.has(w))
    .slice(0, 6);
}

// Every word must be found somewhere, in any order: "apple iphone 13 256"
// finds "iPhone 13 256GB" (brand Apple). The product and category slugs are
// accent-free, so "telephone" finds "Téléphones" and "ecran" finds "Écran".
function wordConditions(q: string | null | undefined): Array<Record<string, unknown>> {
  return searchWords(q).map((word) => ({
    OR: [
      { name: { contains: word, mode: "insensitive" } },
      // "plus" also finds "Galaxy S23+" (the iPhones are written "14 Plus").
      ...(word === "plus" ? [{ name: { contains: "+" } }] : []),
      { brand: { contains: word, mode: "insensitive" } },
      { slug: { contains: word } },
      { tags: { has: word } },
      { category: { name: { contains: word, mode: "insensitive" } } },
      { category: { slug: { contains: word } } },
      { category: { parent: { slug: { contains: word } } } },
    ],
  }));
}

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
  and.push(...wordConditions(filters?.q));
  if (filters?.promo) and.push(ON_PROMO);
  if (filters?.subcategory) and.push({ category: { slug: filters.subcategory } });
  if (filters?.compatibleWith) {
    and.push({ compatibleWithPhones: { some: { compatibleWith: { modelKey: filters.compatibleWith, published: true } } } });
  }
  return and;
}

/** The other colours of an accessory model (owner, 2026-10-29): each colour is
 *  its own product (own stock), linked in the ERP by a shared colorGroup. */
export async function getColorSiblings(colorGroup: string) {
  return prisma.product.findMany({
    where: { colorGroup, published: true, availability: { not: AvailabilityStatus.DISCONTINUED } },
    select: { id: true, slug: true, colorName: true, availability: true },
    orderBy: { createdAt: "asc" },
  });
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

/**
 * Shorter versions of a search that found nothing, closest first: the last
 * word dropped each time ("iphone 15 pro max" → "iphone 15 pro" →
 * "iphone 15" → "iphone"), so a model we don't have shows its neighbours.
 */
export function shorterQueries(q: string): string[] {
  const words = searchWords(q);
  const out: string[] = [];
  for (let n = words.length; n >= 1; n--) {
    const kept = words.slice(0, n);
    if (n < words.length) out.push(kept.join(" "));
    // A model code ("s26", "a16"): then its series ("s2" finds S22 to S25).
    const last = kept[n - 1];
    if (/^[a-z]+\d{2,}$/.test(last)) out.push([...kept.slice(0, -1), last.slice(0, -1)].join(" "));
  }
  return out;
}

/**
 * Accessories matching a search while they're sold in the shop only (not
 * open on the site): the search then says where to find them.
 */
export async function countShopOnlyAccessories(q: string): Promise<number> {
  if (ACCESSORIES_OPEN) return 0;
  const words = searchWords(q);
  if (!words.length) return 0;
  const inStock = { published: true, isPhone: false, availability: AvailabilityStatus.IN_STOCK };
  const n = await prisma.product.count({ where: { AND: [inStock, ...wordConditions(q)] } });
  if (n) return n;
  // "pochette iphone 13": it starts with an accessory aisle's name, even if
  // no product name says "13". (Not "iphone …": chargers are named that way.)
  const first = words[0];
  if (first.length < 4) return 0;
  return prisma.product.count({
    where: { ...inStock, category: { OR: [{ slug: { contains: first } }, { name: { contains: first, mode: "insensitive" } }] } },
  });
}

// `query` and `filters` are independent — the header search bar uses query
// alone, the homepage phone-finder uses filters alone, and either can
// combine both. At least one of the two must be present or this returns
// nothing, so a bare `/search` visit doesn't dump the whole catalog.
export async function searchProducts(
  query: string,
  filters?: ProductFilters
): Promise<PublicProduct[]> {
  const filterConditions = buildFilterConditions({ ...filters, q: query });
  if (filterConditions.length === 0) return [];

  return prisma.product.findMany({
    where: {
      AND: [
        { published: true, ...OPEN_PRODUCTS },
        { availability: { not: AvailabilityStatus.DISCONTINUED } },
        ...filterConditions,
      ],
    },
    select: PUBLIC_PRODUCT_SELECT,
    // In stock first, then phones, then cheapest
    orderBy: [{ availability: "asc" }, { isPhone: "desc" }, { recommendedSalePrice: "asc" }],
    take: 48,
  });
}

export type SearchSuggestion = {
  slug: string;
  name: string;
  brand: string | null;
  price: string;
  fromPrice: boolean;
  compareAtPrice: string | null;
  image: string | null;
  condition: string;
  isPhone: boolean;
};

/** The first matches for the header's live suggestions (as the customer types). */
export async function suggestProducts(query: string, take = 6): Promise<{ items: SearchSuggestion[]; total: number }> {
  const words = wordConditions(query);
  if (!words.length) return { items: [], total: 0 };
  const where = {
    AND: [{ published: true, ...OPEN_PRODUCTS }, { availability: { not: AvailabilityStatus.DISCONTINUED } }, ...words],
  };
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        slug: true, name: true, brand: true, condition: true, isPhone: true,
        recommendedSalePrice: true, compareAtPrice: true,
        images: { select: { url: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        variants: { where: { stockQuantity: { gt: 0 } }, select: { priceOverride: true } },
      },
      orderBy: [{ availability: "asc" }, { isPhone: "desc" }, { recommendedSalePrice: "asc" }],
      take,
    }),
    prisma.product.count({ where }),
  ]);
  return {
    total,
    items: rows.map((r) => ({
      slug: r.slug,
      name: r.name,
      brand: r.brand,
      price: r.recommendedSalePrice.toString(),
      fromPrice: new Set(r.variants.map((v) => v.priceOverride?.toString())).size > 1,
      compareAtPrice: r.compareAtPrice?.toString() ?? null,
      image: r.images[0]?.url ?? null,
      condition: r.condition,
      isPhone: r.isPhone,
    })),
  };
}

// In stock, newest first — photographed products ahead of the rest, so a
// shop-window shelf leads with real photos.
export async function getFeaturedProducts(
  limit = 8,
  where: { isPhone?: boolean } = {}
): Promise<PublicProduct[]> {
  const rows = await prisma.product.findMany({
    where: { availability: AvailabilityStatus.IN_STOCK, published: true, ...where },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: [{ images: { _count: "desc" } }, { createdAt: "desc" }],
    take: limit * 3,
  });
  return bestFirst(rows).slice(0, limit);
}

const GRADE_RANK: Record<string, number> = { NEUF: 0, TRES_BON: 1, BON: 2, PIECES_REMPLACEES: 3 };

/**
 * A shop window's order: photographed first, then the best condition, then
 * promos, then newest (the query's order). The first phones a visitor sees
 * set the tone: a "pièces remplacées" unit shouldn't lead.
 */
export function bestFirst<T extends { condition: string; compareAtPrice?: unknown; images?: unknown[] }>(rows: T[]): T[] {
  return rows
    .map((r, i) => ({ r, i }))
    .sort(
      (a, b) =>
        Number(!!b.r.images?.length) - Number(!!a.r.images?.length) ||
        (GRADE_RANK[a.r.condition] ?? 9) - (GRADE_RANK[b.r.condition] ?? 9) ||
        Number(!!b.r.compareAtPrice) - Number(!!a.r.compareAtPrice) ||
        a.i - b.i
    )
    .map(({ r }) => r);
}

/**
 * Every product a visitor can find, aisle by aisle: for the Meta catalogue
 * feed and the "Tous nos prix" page. Phones first, then accessories.
 */
export async function getAllPublicProducts(): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: { published: true, ...OPEN_PRODUCTS, availability: { not: AvailabilityStatus.DISCONTINUED } },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: [{ isPhone: "desc" }, { category: { sortOrder: "asc" } }, { recommendedSalePrice: "asc" }],
  });
}

/** Other products from the same aisle, for "Dans le même rayon" on a product page. */
export async function getRelatedProducts(
  product: { id: string; category: { id: string } },
  limit = 4
): Promise<PublicProduct[]> {
  return prisma.product.findMany({
    where: {
      published: true,
      ...OPEN_PRODUCTS,
      availability: AvailabilityStatus.IN_STOCK,
      categoryId: product.category.id,
      id: { not: product.id },
    },
    select: PUBLIC_PRODUCT_SELECT,
    orderBy: [{ images: { _count: "desc" } }, { createdAt: "desc" }],
    take: limit,
  });
}

export type CategoryFilterOptions = {
  kind: "phones" | "accessories";
  hasPromos: boolean; // show the "En promo" filter only when there is something to find
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
  if (!category) return { kind: "accessories", hasPromos: false, brands: [], storages: [], subcategories: [], phoneModels: [] };
  const ids = [category.id, ...category.children.map((c) => c.id)];
  const hasPromos =
    (await prisma.product.count({
      where: {
        AND: [
          { categoryId: { in: ids }, published: true, availability: { not: AvailabilityStatus.DISCONTINUED } },
          ON_PROMO,
        ],
      },
    })) > 0;

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
    return { kind, hasPromos, brands, storages, subcategories: [], phoneModels: [] };
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
  return { kind, hasPromos, brands, storages: [], subcategories, phoneModels };
}
