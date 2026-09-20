import "dotenv/config";
import { prisma } from "../lib/db/client";

// Demo data for internal review only — NOT for the public launch. Real
// catalog entry replaces every one of these once you're ready to go live.
//
// `.png` suffix (not the placehold.co default `.svg`) — next.config.ts's
// image optimizer has `dangerouslyAllowSVG` off, so an `.svg` placeholder
// would render as a broken image on every product card/page.
function img(label: string) {
  return `https://placehold.co/600x600.png?text=${encodeURIComponent(label)}`;
}

type Variant = { name: string; priceOverride?: number; skuOrRef?: string };

type ProductSeed = {
  slug: string;
  name: string;
  brand: string;
  isPhone: boolean;
  condition: "NEUF" | "TRES_BON" | "BON" | "PIECES_REMPLACEES";
  description?: string;
  specs?: Record<string, string>;
  price: number;
  compareAt?: number;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "COMING_SOON" | "DISCONTINUED";
  tags?: string[];
  battery?: number;
  faceId?: boolean | null;
  screenGenuine?: boolean | null;
  batteryGenuine?: boolean | null;
  hasDefects?: boolean;
  transparencyNotes?: string;
  variants?: Variant[];
  // ProductInternal (staff-only) — omitted fields get sane defaults below.
  purchasePrice: number;
  minSalePrice?: number;
  stock: number;
  supplier?: string;
  sourceNote?: string;
};

async function main() {
  // ── Categories ──────────────────────────────────────────────────────
  const telephones = await prisma.category.upsert({
    where: { slug: "telephones" },
    update: {},
    create: { name: "Téléphones", slug: "telephones", sortOrder: 1 },
  });

  const accessoires = await prisma.category.upsert({
    where: { slug: "accessoires" },
    update: {},
    create: { name: "Accessoires", slug: "accessoires", sortOrder: 2 },
  });

  const pochettes = await prisma.category.upsert({
    where: { slug: "pochettes" },
    update: {},
    create: { name: "Pochettes", slug: "pochettes", sortOrder: 1, parentId: accessoires.id },
  });

  const incassables = await prisma.category.upsert({
    where: { slug: "incassables" },
    update: {},
    create: { name: "Incassables", slug: "incassables", sortOrder: 2, parentId: accessoires.id },
  });

  const chargeurs = await prisma.category.upsert({
    where: { slug: "chargeurs" },
    update: {},
    create: { name: "Chargeurs", slug: "chargeurs", sortOrder: 3, parentId: accessoires.id },
  });

  const cables = await prisma.category.upsert({
    where: { slug: "cables" },
    update: {},
    create: { name: "Câbles", slug: "cables", sortOrder: 4, parentId: accessoires.id },
  });

  const ecouteurs = await prisma.category.upsert({
    where: { slug: "ecouteurs" },
    update: {},
    create: { name: "Écouteurs", slug: "ecouteurs", sortOrder: 5, parentId: accessoires.id },
  });

  const categoryId: Record<string, string> = {
    telephones: telephones.id,
    pochettes: pochettes.id,
    incassables: incassables.id,
    chargeurs: chargeurs.id,
    cables: cables.id,
    ecouteurs: ecouteurs.id,
  };

  // ── Phones ──────────────────────────────────────────────────────────
  const phones: ProductSeed[] = [
    {
      slug: "iphone-13-128go",
      name: "iPhone 13 128Go",
      brand: "Apple",
      isPhone: true,
      condition: "TRES_BON",
      description: "iPhone 13 en très bon état, testé et garanti 3 mois.",
      specs: { Stockage: "128GB", Couleur: "Bleu", Écran: "6.1 pouces" },
      price: 6500,
      compareAt: 7200,
      tags: ["photo", "apple"],
      battery: 89,
      faceId: true,
      screenGenuine: true,
      batteryGenuine: false,
      variants: [
        { name: "128GB — Bleu", skuOrRef: "IP13-128-BLU" },
        { name: "256GB — Bleu", priceOverride: 7300, skuOrRef: "IP13-256-BLU" },
      ],
      purchasePrice: 5200,
      stock: 2,
      supplier: "Reprise client",
    },
    {
      slug: "samsung-galaxy-a32",
      name: "Samsung Galaxy A32",
      brand: "Samsung",
      isPhone: true,
      condition: "BON",
      description: "Galaxy A32, bon état général, quelques micro-rayures.",
      specs: { Stockage: "64GB", RAM: "4GB" },
      price: 2200,
      tags: ["productivite", "samsung"],
      battery: 84,
      screenGenuine: true,
      hasDefects: true,
      transparencyNotes: "Petites rayures sur la coque arrière, écran impeccable.",
      purchasePrice: 1650,
      stock: 1,
      supplier: "Reprise client",
    },
    {
      slug: "iphone-12-64go",
      name: "iPhone 12 64Go",
      brand: "Apple",
      isPhone: true,
      condition: "BON",
      description: "iPhone 12 fiable au quotidien, quelques micro-rayures sur la tranche.",
      specs: { Stockage: "64GB", Couleur: "Noir", Écran: "6.1 pouces" },
      price: 4800,
      compareAt: 5400,
      tags: ["apple", "photo"],
      battery: 81,
      faceId: true,
      screenGenuine: true,
      batteryGenuine: true,
      purchasePrice: 3800,
      stock: 1,
      supplier: "Import Dubaï",
    },
    {
      slug: "iphone-14-128go",
      name: "iPhone 14 128Go",
      brand: "Apple",
      isPhone: true,
      condition: "NEUF",
      description: "iPhone 14 neuf, sous scellé, garantie officielle.",
      specs: { Stockage: "128GB", Couleur: "Minuit", Écran: "6.1 pouces" },
      price: 9200,
      tags: ["apple", "photo", "gaming"],
      battery: 100,
      faceId: true,
      screenGenuine: true,
      batteryGenuine: true,
      purchasePrice: 7600,
      stock: 3,
      supplier: "Grossiste Casablanca",
    },
    {
      slug: "iphone-se-2022",
      name: "iPhone SE 2022",
      brand: "Apple",
      isPhone: true,
      condition: "TRES_BON",
      description: "Compact et rapide, idéal pour les appels et réseaux sociaux.",
      specs: { Stockage: "64GB", Couleur: "Blanc", Écran: "4.7 pouces" },
      price: 3600,
      availability: "OUT_OF_STOCK",
      tags: ["apple"],
      battery: 86,
      faceId: null,
      screenGenuine: true,
      batteryGenuine: true,
      purchasePrice: 2900,
      stock: 0,
      supplier: "Reprise client",
    },
    {
      slug: "samsung-galaxy-s21",
      name: "Samsung Galaxy S21",
      brand: "Samsung",
      isPhone: true,
      condition: "TRES_BON",
      description: "Galaxy S21 puissant, parfait pour le gaming et la photo.",
      specs: { Stockage: "128GB", RAM: "8GB", Couleur: "Gris" },
      price: 5200,
      compareAt: 5800,
      tags: ["samsung", "gaming", "photo"],
      battery: 88,
      screenGenuine: true,
      batteryGenuine: true,
      variants: [
        { name: "128GB", skuOrRef: "S21-128" },
        { name: "256GB", priceOverride: 5700, skuOrRef: "S21-256" },
      ],
      purchasePrice: 4100,
      stock: 2,
      supplier: "Import Dubaï",
    },
    {
      slug: "samsung-galaxy-a54",
      name: "Samsung Galaxy A54",
      brand: "Samsung",
      isPhone: true,
      condition: "NEUF",
      description: "Nouveau modèle Samsung, disponible très bientôt en boutique.",
      specs: { Stockage: "128GB", RAM: "6GB" },
      price: 4200,
      availability: "COMING_SOON",
      tags: ["samsung", "photo"],
      battery: 100,
      purchasePrice: 3400,
      stock: 0,
      supplier: "Grossiste Casablanca",
    },
    {
      slug: "samsung-galaxy-note-20",
      name: "Samsung Galaxy Note 20",
      brand: "Samsung",
      isPhone: true,
      condition: "PIECES_REMPLACEES",
      description: "Note 20 remis en état après réparation, fonctionne parfaitement.",
      specs: { Stockage: "256GB", RAM: "8GB" },
      price: 3900,
      tags: ["samsung", "productivite"],
      battery: 78,
      screenGenuine: false,
      batteryGenuine: false,
      hasDefects: true,
      transparencyNotes:
        "Écran remplacé par une pièce compatible (non d'origine) suite à une casse, fonctionne parfaitement. Batterie également remplacée.",
      purchasePrice: 2600,
      stock: 1,
      supplier: "Douane auction",
    },
    {
      slug: "xiaomi-redmi-note-12",
      name: "Xiaomi Redmi Note 12",
      brand: "Xiaomi",
      isPhone: true,
      condition: "NEUF",
      description: "Excellent rapport qualité-prix, neuf sous garantie.",
      specs: { Stockage: "128GB", RAM: "6GB" },
      price: 2400,
      tags: ["xiaomi", "photo"],
      battery: 100,
      purchasePrice: 1900,
      stock: 4,
      supplier: "Grossiste Casablanca",
    },
    {
      slug: "xiaomi-poco-x5",
      name: "Xiaomi Poco X5",
      brand: "Xiaomi",
      isPhone: true,
      condition: "TRES_BON",
      description: "Bon compromis performance/prix pour le gaming mobile.",
      specs: { Stockage: "128GB", RAM: "8GB" },
      price: 2800,
      tags: ["xiaomi", "gaming"],
      battery: 91,
      screenGenuine: true,
      batteryGenuine: true,
      purchasePrice: 2200,
      stock: 2,
      supplier: "Import Dubaï",
    },
    {
      slug: "xiaomi-mi-11",
      name: "Xiaomi Mi 11",
      brand: "Xiaomi",
      isPhone: true,
      condition: "BON",
      description: "Modèle retiré de la vente — stock épuisé définitivement.",
      specs: { Stockage: "128GB", RAM: "8GB" },
      price: 3100,
      availability: "DISCONTINUED",
      tags: ["xiaomi"],
      battery: 75,
      purchasePrice: 2400,
      stock: 0,
      supplier: "Reprise client",
    },
    {
      slug: "huawei-p30-lite",
      name: "Huawei P30 Lite",
      brand: "Huawei",
      isPhone: true,
      condition: "BON",
      description: "Huawei P30 Lite fiable, léger et compact.",
      specs: { Stockage: "128GB", RAM: "4GB" },
      price: 1800,
      tags: ["huawei"],
      battery: 80,
      purchasePrice: 1350,
      stock: 2,
      supplier: "Reprise client",
    },
    {
      slug: "huawei-y9-prime",
      name: "Huawei Y9 Prime",
      brand: "Huawei",
      isPhone: true,
      condition: "PIECES_REMPLACEES",
      description: "Remis en état après une chute, entièrement fonctionnel.",
      specs: { Stockage: "128GB", RAM: "4GB" },
      price: 1500,
      availability: "OUT_OF_STOCK",
      tags: ["huawei"],
      battery: 70,
      screenGenuine: false,
      hasDefects: true,
      transparencyNotes: "Écran et batterie remplacés suite à une chute, entièrement fonctionnel.",
      purchasePrice: 1050,
      stock: 0,
      supplier: "Douane auction",
    },
  ];

  // ── Accessories ─────────────────────────────────────────────────────
  const accessories: (ProductSeed & { categorySlug: string })[] = [
    // Pochettes
    {
      categorySlug: "pochettes",
      slug: "pochette-cuir-iphone-13",
      name: "Pochette cuir iPhone 13",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 90,
      purchasePrice: 35,
      stock: 18,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "pochettes",
      slug: "pochette-silicone-samsung-a32",
      name: "Pochette silicone Samsung A32",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 60,
      purchasePrice: 22,
      stock: 25,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "pochettes",
      slug: "pochette-transparente-universelle",
      name: "Pochette transparente universelle",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 40,
      variants: [
        { name: "Pour iPhone", skuOrRef: "POC-TR-IP" },
        { name: "Pour Samsung", skuOrRef: "POC-TR-SA" },
      ],
      purchasePrice: 15,
      stock: 40,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "pochettes",
      slug: "pochette-portefeuille-iphone-14",
      name: "Pochette portefeuille iPhone 14",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 130,
      availability: "OUT_OF_STOCK",
      purchasePrice: 55,
      stock: 0,
      supplier: "Import Dubaï",
    },

    // Incassables
    {
      categorySlug: "incassables",
      slug: "verre-trempe-iphone-13",
      name: "Verre trempé iPhone 13",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 50,
      purchasePrice: 15,
      stock: 30,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "incassables",
      slug: "verre-trempe-samsung-a32",
      name: "Verre trempé Samsung A32",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 45,
      purchasePrice: 13,
      stock: 28,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "incassables",
      slug: "verre-trempe-universel",
      name: "Verre trempé universel",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 35,
      purchasePrice: 10,
      stock: 50,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "incassables",
      slug: "coque-antichoc-iphone-14",
      name: "Coque antichoc iPhone 14",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 80,
      purchasePrice: 30,
      stock: 16,
      supplier: "Import Dubaï",
    },

    // Chargeurs
    {
      categorySlug: "chargeurs",
      slug: "chargeur-rapide-20w",
      name: "Chargeur rapide 20W",
      brand: "Oraimo",
      isPhone: false,
      condition: "NEUF",
      price: 120,
      purchasePrice: 55,
      stock: 22,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "chargeurs",
      slug: "chargeur-sans-fil-15w",
      name: "Chargeur sans fil 15W",
      brand: "Oraimo",
      isPhone: false,
      condition: "NEUF",
      price: 180,
      purchasePrice: 90,
      stock: 12,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "chargeurs",
      slug: "chargeur-voiture-double-usb",
      name: "Chargeur voiture double USB",
      brand: "Anker",
      isPhone: false,
      condition: "NEUF",
      price: 90,
      purchasePrice: 40,
      stock: 15,
      supplier: "Import Dubaï",
    },
    {
      categorySlug: "chargeurs",
      slug: "chargeur-original-samsung-25w",
      name: "Chargeur original Samsung 25W",
      brand: "Samsung",
      isPhone: false,
      condition: "NEUF",
      price: 220,
      availability: "COMING_SOON",
      purchasePrice: 150,
      stock: 0,
      supplier: "Grossiste Casablanca",
    },

    // Câbles
    {
      categorySlug: "cables",
      slug: "cable-usbc-lightning-1m",
      name: "Câble USB-C vers Lightning 1m",
      brand: "Anker",
      isPhone: false,
      condition: "NEUF",
      price: 70,
      purchasePrice: 28,
      stock: 20,
      supplier: "Import Dubaï",
    },
    {
      categorySlug: "cables",
      slug: "cable-usbc-usbc-2m",
      name: "Câble USB-C vers USB-C 2m",
      brand: "Oraimo",
      isPhone: false,
      condition: "NEUF",
      price: 55,
      purchasePrice: 20,
      stock: 24,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "cables",
      slug: "cable-microusb-renforce",
      name: "Câble Micro-USB renforcé",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 35,
      availability: "OUT_OF_STOCK",
      purchasePrice: 12,
      stock: 0,
      supplier: "Grossiste Casablanca",
    },

    // Écouteurs
    {
      categorySlug: "ecouteurs",
      slug: "ecouteurs-bluetooth-oraimo",
      name: "Écouteurs Bluetooth Oraimo",
      brand: "Oraimo",
      isPhone: false,
      condition: "NEUF",
      price: 250,
      variants: [
        { name: "Noir", skuOrRef: "ORA-EB-BLK" },
        { name: "Blanc", skuOrRef: "ORA-EB-WHT" },
      ],
      purchasePrice: 130,
      stock: 14,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "ecouteurs",
      slug: "ecouteurs-filaires-universels",
      name: "Écouteurs filaires universels",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      price: 45,
      purchasePrice: 16,
      stock: 35,
      supplier: "Grossiste Casablanca",
    },
    {
      categorySlug: "ecouteurs",
      slug: "casque-bluetooth-over-ear",
      name: "Casque Bluetooth over-ear",
      brand: "Oraimo",
      isPhone: false,
      condition: "NEUF",
      price: 380,
      purchasePrice: 210,
      stock: 8,
      supplier: "Import Dubaï",
    },
  ];

  async function seedProduct(item: ProductSeed, catId: string) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        slug: item.slug,
        name: item.name,
        brand: item.brand,
        isPhone: item.isPhone,
        condition: item.condition,
        description: item.description,
        specs: item.specs,
        recommendedSalePrice: item.price,
        compareAtPrice: item.compareAt,
        availability: item.availability ?? "IN_STOCK",
        tags: item.tags ?? [],
        batteryHealthPercent: item.battery ?? null,
        faceIdWorking: item.faceId ?? null,
        screenGenuine: item.screenGenuine ?? null,
        batteryGenuine: item.batteryGenuine ?? null,
        hasDefects: item.hasDefects ?? false,
        transparencyNotes: item.transparencyNotes,
        categoryId: catId,
        images: { create: [{ url: img(item.name), sortOrder: 0 }] },
        variants: item.variants
          ? { create: item.variants.map((v) => ({ name: v.name, priceOverride: v.priceOverride, skuOrRef: v.skuOrRef })) }
          : undefined,
      },
    });

    // `upsert`'s `update: {}` above never touches nested images on a
    // product that already existed from a previous seed run — sync the
    // cover image explicitly so a URL-format change (e.g. .svg -> .png)
    // actually reaches already-seeded rows, not just newly created ones.
    const existingImage = await prisma.productImage.findFirst({
      where: { productId: product.id },
      orderBy: { sortOrder: "asc" },
    });
    if (existingImage) {
      await prisma.productImage.update({
        where: { id: existingImage.id },
        data: { url: img(item.name) },
      });
    }

    await prisma.productInternal.upsert({
      where: { productId: product.id },
      update: {},
      create: {
        productId: product.id,
        purchasePrice: item.purchasePrice,
        minSalePrice: item.minSalePrice ?? Math.round(item.price * 0.92),
        supplier: item.supplier,
        sourceNote: item.sourceNote,
        stockQuantity: item.stock,
      },
    });

    return product;
  }

  for (const phone of phones) {
    await seedProduct(phone, categoryId.telephones);
  }
  for (const accessory of accessories) {
    await seedProduct(accessory, categoryId[accessory.categorySlug]);
  }

  // ── Compatibility / gift options ───────────────────────────────────
  // [accessorySlug, phoneSlug, isGiftOption]
  const compatibility: [string, string, boolean][] = [
    ["pochette-cuir-iphone-13", "iphone-13-128go", true],
    ["verre-trempe-iphone-13", "iphone-13-128go", true],
    ["chargeur-rapide-20w", "iphone-13-128go", false],

    ["pochette-portefeuille-iphone-14", "iphone-14-128go", true],
    ["coque-antichoc-iphone-14", "iphone-14-128go", true],
    ["cable-usbc-lightning-1m", "iphone-14-128go", false],

    ["pochette-silicone-samsung-a32", "samsung-galaxy-a32", true],
    ["verre-trempe-samsung-a32", "samsung-galaxy-a32", true],
    ["chargeur-rapide-20w", "samsung-galaxy-a32", false],

    ["verre-trempe-universel", "iphone-12-64go", false],
    ["verre-trempe-universel", "samsung-galaxy-s21", false],
    ["verre-trempe-universel", "xiaomi-redmi-note-12", false],
    ["pochette-transparente-universelle", "xiaomi-poco-x5", false],
    ["cable-usbc-usbc-2m", "samsung-galaxy-s21", false],
  ];

  const productIdBySlug: Record<string, string> = {};
  for (const slug of [...phones.map((p) => p.slug), ...accessories.map((a) => a.slug)]) {
    const p = await prisma.product.findUniqueOrThrow({ where: { slug }, select: { id: true } });
    productIdBySlug[slug] = p.id;
  }

  for (const [accessorySlug, phoneSlug, isGiftOption] of compatibility) {
    const productId = productIdBySlug[accessorySlug];
    const compatibleWithId = productIdBySlug[phoneSlug];
    await prisma.productCompatibility.upsert({
      where: { productId_compatibleWithId: { productId, compatibleWithId } },
      update: {},
      create: { productId, compatibleWithId, isGiftOption },
    });
  }

  console.log(
    `Seed terminé ✓ — ${phones.length} téléphones, ${accessories.length} accessoires, 6 catégories (2 parentes + 4 enfants), ${compatibility.length} liens de compatibilité.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
