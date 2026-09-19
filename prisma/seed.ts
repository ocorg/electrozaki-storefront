import "dotenv/config";
import { prisma } from "../lib/db/client";

// Demo data for internal review only — NOT for the public launch. Real
// catalog entry replaces every one of these once you're ready to go live.
async function main() {
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
    create: {
      name: "Pochettes",
      slug: "pochettes",
      sortOrder: 1,
      parentId: accessoires.id,
    },
  });

  const incassables = await prisma.category.upsert({
    where: { slug: "incassables" },
    update: {},
    create: {
      name: "Incassables",
      slug: "incassables",
      sortOrder: 2,
      parentId: accessoires.id,
    },
  });

  const chargeurs = await prisma.category.upsert({
    where: { slug: "chargeurs" },
    update: {},
    create: {
      name: "Chargeurs",
      slug: "chargeurs",
      sortOrder: 3,
      parentId: accessoires.id,
    },
  });

  const iphone13 = await prisma.product.upsert({
    where: { slug: "iphone-13-128go" },
    update: {},
    create: {
      slug: "iphone-13-128go",
      name: "iPhone 13 128Go",
      brand: "Apple",
      isPhone: true,
      condition: "TRES_BON",
      description: "iPhone 13 en très bon état, testé et garanti 3 mois.",
      specs: { Stockage: "128GB", Couleur: "Bleu", Écran: "6.1 pouces" },
      recommendedSalePrice: 6500,
      compareAtPrice: 7200,
      availability: "IN_STOCK",
      tags: ["photo", "apple"],
      batteryHealthPercent: 89,
      faceIdWorking: true,
      screenGenuine: true,
      batteryGenuine: false,
      hasDefects: false,
      categoryId: telephones.id,
      images: {
        create: [{ url: "https://placehold.co/600x600?text=iPhone+13", sortOrder: 0 }],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "samsung-galaxy-a32" },
    update: {},
    create: {
      slug: "samsung-galaxy-a32",
      name: "Samsung Galaxy A32",
      brand: "Samsung",
      isPhone: true,
      condition: "BON",
      description: "Galaxy A32, bon état général, quelques micro-rayures.",
      specs: { Stockage: "64GB", RAM: "4GB" },
      recommendedSalePrice: 2200,
      availability: "IN_STOCK",
      tags: ["productivite", "samsung"],
      batteryHealthPercent: 84,
      screenGenuine: true,
      hasDefects: true,
      transparencyNotes: "Petites rayures sur la coque arrière, écran impeccable.",
      categoryId: telephones.id,
      images: {
        create: [{ url: "https://placehold.co/600x600?text=Galaxy+A32", sortOrder: 0 }],
      },
    },
  });

  const pochetteIphone = await prisma.product.upsert({
    where: { slug: "pochette-cuir-iphone-13" },
    update: {},
    create: {
      slug: "pochette-cuir-iphone-13",
      name: "Pochette cuir iPhone 13",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      recommendedSalePrice: 90,
      availability: "IN_STOCK",
      tags: [],
      categoryId: pochettes.id,
      images: {
        create: [{ url: "https://placehold.co/600x600?text=Pochette", sortOrder: 0 }],
      },
    },
  });

  const incassableIphone = await prisma.product.upsert({
    where: { slug: "verre-trempe-iphone-13" },
    update: {},
    create: {
      slug: "verre-trempe-iphone-13",
      name: "Verre trempé iPhone 13",
      brand: "Générique",
      isPhone: false,
      condition: "NEUF",
      recommendedSalePrice: 50,
      availability: "IN_STOCK",
      tags: [],
      categoryId: incassables.id,
      images: {
        create: [{ url: "https://placehold.co/600x600?text=Verre+Tremp%C3%A9", sortOrder: 0 }],
      },
    },
  });

  const chargeurRapide = await prisma.product.upsert({
    where: { slug: "chargeur-rapide-20w" },
    update: {},
    create: {
      slug: "chargeur-rapide-20w",
      name: "Chargeur rapide 20W",
      brand: "Oraimo",
      isPhone: false,
      condition: "NEUF",
      recommendedSalePrice: 120,
      availability: "IN_STOCK",
      tags: [],
      categoryId: chargeurs.id,
      images: {
        create: [{ url: "https://placehold.co/600x600?text=Chargeur", sortOrder: 0 }],
      },
    },
  });

  // Gift options for the iPhone 13 (pochette + incassable), plus a
  // compatible-but-not-gift accessory (chargeur) — exercises the gift
  // picker's "one per category" logic and the compatibility selector.
  await prisma.productCompatibility.upsert({
    where: {
      productId_compatibleWithId: { productId: pochetteIphone.id, compatibleWithId: iphone13.id },
    },
    update: {},
    create: { productId: pochetteIphone.id, compatibleWithId: iphone13.id, isGiftOption: true },
  });

  await prisma.productCompatibility.upsert({
    where: {
      productId_compatibleWithId: {
        productId: incassableIphone.id,
        compatibleWithId: iphone13.id,
      },
    },
    update: {},
    create: { productId: incassableIphone.id, compatibleWithId: iphone13.id, isGiftOption: true },
  });

  await prisma.productCompatibility.upsert({
    where: {
      productId_compatibleWithId: { productId: chargeurRapide.id, compatibleWithId: iphone13.id },
    },
    update: {},
    create: { productId: chargeurRapide.id, compatibleWithId: iphone13.id, isGiftOption: false },
  });

  console.log("Seed terminé ✓ — 2 téléphones, 3 accessoires, 2 catégories parentes.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
