import { AvailabilityStatus } from "@/generated/prisma/enums";
import { allocateBundlePrices } from "@/lib/bundle-pricing";
import { prisma } from "./client";
import { landingStatus, landingPrice, landingProductIds } from "./landing";

// ─────────────────────────────────────────────────────────────────────────
// The ONLY source of truth for what an order costs. The browser's cart
// sends which products it wants (and whether a line is a gift or part of a
// pack) — never a price it's allowed to set. Every price, the free-gift
// rule, pack prices, stock and the 300 DH advance rule are recomputed here
// from the database.
// ─────────────────────────────────────────────────────────────────────────

export type CartLineInput = {
  productId: string;
  variantId?: string;
  quantity: number;
  isGift?: boolean;
  bundleId?: string;
  /** added from a promo page (/offres/…): gets that page's price while it is live */
  landingId?: string;
};

export type PricedLine = {
  productId: string;
  variantId?: string;
  unitRef?: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  isGift: boolean;
  bundleId?: string;
};

export type PricedCart =
  | { ok: true; lines: PricedLine[]; subtotal: number; requiresAdvance: boolean; landingPageId?: string }
  | { ok: false; error: string };

const MAX_LINES = 30;
const MAX_QTY = 20;

function fail(error: string): PricedCart {
  return { ok: false, error };
}

export async function priceCart(rawLines: CartLineInput[]): Promise<PricedCart> {
  if (!Array.isArray(rawLines) || rawLines.length === 0) return fail("Votre panier est vide.");
  if (rawLines.length > MAX_LINES) return fail("Votre panier contient trop d'articles.");

  const lines = rawLines.map((l) => ({
    productId: String(l.productId ?? ""),
    variantId: l.variantId ? String(l.variantId) : undefined,
    quantity: Number(l.quantity),
    isGift: l.isGift === true,
    bundleId: l.bundleId ? String(l.bundleId) : undefined,
    landingId: l.landingId ? String(l.landingId) : undefined,
  }));
  if (lines.some((l) => !l.productId || !Number.isInteger(l.quantity) || l.quantity < 1 || l.quantity > MAX_QTY)) {
    return fail("Quantité invalide dans le panier.");
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...new Set(lines.map((l) => l.productId))] }, published: true },
    select: {
      id: true,
      name: true,
      isPhone: true,
      source: true,
      availability: true,
      recommendedSalePrice: true,
      categoryId: true,
      internal: { select: { stockQuantity: true } },
      variants: { select: { id: true, name: true, priceOverride: true, stockQuantity: true, erpRef: true } },
      compatibleAccessories: {
        where: { isGiftOption: true },
        select: { productId: true, product: { select: { categoryId: true } } },
      },
    },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const priced: PricedLine[] = [];
  // Units reserved by this cart per variant/product, to check stock across
  // lines (the same phone can't be both a paid line and a pack line).
  const usedStock = new Map<string, number>();

  function takeStock(key: string, qty: number, available: number | null): boolean {
    const used = (usedStock.get(key) ?? 0) + qty;
    usedStock.set(key, used);
    return available === null || used <= available;
  }

  function resolveLine(line: (typeof lines)[number]) {
    const product = byId.get(line.productId);
    if (!product || product.availability !== AvailabilityStatus.IN_STOCK) {
      return { error: "Un article de votre panier n'est plus disponible. Merci de le retirer." };
    }
    let variant: (typeof product.variants)[number] | undefined;
    if (product.variants.length > 0) {
      variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) return { error: `Merci de choisir une option pour « ${product.name} ».` };
    } else if (line.variantId) {
      return { error: "Un article de votre panier n'est plus disponible. Merci de le retirer." };
    }

    // Stock: a variant carries its own count; an ERP product without
    // variants keeps its count in ProductInternal; a hand-made product
    // without variants isn't stock-tracked.
    const stockKey = variant ? `v:${variant.id}` : `p:${product.id}`;
    const available = variant
      ? variant.stockQuantity
      : product.source === "ERP"
        ? (product.internal?.stockQuantity ?? 0)
        : null;
    if (!takeStock(stockKey, line.quantity, available)) {
      return { error: `Stock insuffisant pour « ${product.name} ». Merci de réduire la quantité.` };
    }

    const normalPrice = Number(variant?.priceOverride ?? product.recommendedSalePrice);
    return { product, variant, normalPrice };
  }

  // ── Promo pages used by this cart: must be live, and offer the product ──
  const landingIds = [...new Set(lines.filter((l) => l.landingId && !l.isGift && !l.bundleId).map((l) => l.landingId!))];
  const landings = new Map<string, { title: string; price: (normal: number) => number; offers: Set<string> }>();
  for (const id of landingIds) {
    const page = await prisma.landingPage.findUnique({
      where: { id },
      select: { title: true, active: true, startsAt: true, endsAt: true, discountType: true, discountValue: true },
    });
    if (!page || landingStatus(page) !== "live") {
      return fail(`L'offre « ${page?.title ?? "promo"} » est terminée : retirez l'article de votre panier puis ajoutez-le à nouveau depuis la boutique.`);
    }
    landings.set(id, { title: page.title, price: (n) => landingPrice(page, n), offers: new Set(await landingProductIds(id)) });
  }

  // ── Regular lines ──
  for (const line of lines.filter((l) => !l.isGift && !l.bundleId)) {
    const r = resolveLine(line);
    if ("error" in r) return fail(r.error!);
    const landing = line.landingId ? landings.get(line.landingId) : undefined;
    if (landing && !landing.offers.has(r.product.id)) {
      return fail(`« ${r.product.name} » ne fait plus partie de l'offre « ${landing.title} ». Retirez-le du panier.`);
    }
    priced.push({
      productId: r.product.id,
      variantId: r.variant?.id,
      unitRef: r.variant?.erpRef ?? undefined,
      productName: landing ? `${r.product.name} (offre ${landing.title})` : r.product.name,
      variantName: r.variant?.name,
      unitPrice: landing ? landing.price(r.normalPrice) : r.normalPrice,
      quantity: line.quantity,
      isGift: false,
    });
  }

  // ── Pack lines: must match the pack exactly (k × its composition) ──
  const bundleIds = [...new Set(lines.filter((l) => l.bundleId && !l.isGift).map((l) => l.bundleId!))];
  if (bundleIds.length) {
    const bundles = await prisma.bundle.findMany({
      where: { id: { in: bundleIds }, active: true },
      select: { id: true, name: true, bundlePrice: true, items: { select: { productId: true, quantity: true } } },
    });
    for (const bundleId of bundleIds) {
      const bundle = bundles.find((b) => b.id === bundleId);
      if (!bundle) return fail("Un pack de votre panier n'est plus proposé. Merci de le retirer.");
      const bundleLines = lines.filter((l) => l.bundleId === bundleId && !l.isGift);

      const first = bundle.items[0];
      const firstLine = bundleLines.find((l) => l.productId === first?.productId);
      if (!first || !firstLine || firstLine.quantity % first.quantity !== 0) {
        return fail(`Le pack « ${bundle.name} » est incomplet. Merci de le retirer puis de l'ajouter à nouveau.`);
      }
      const k = firstLine.quantity / first.quantity;
      const complete =
        bundleLines.length === bundle.items.length &&
        bundle.items.every((item) => {
          const l = bundleLines.find((x) => x.productId === item.productId);
          return l && l.quantity === item.quantity * k;
        });
      if (!complete) {
        return fail(`Le pack « ${bundle.name} » est incomplet. Merci de le retirer puis de l'ajouter à nouveau.`);
      }

      const resolved = [];
      for (const item of bundle.items) {
        const line = bundleLines.find((x) => x.productId === item.productId)!;
        const r = resolveLine(line);
        if ("error" in r) return fail(r.error!);
        resolved.push({ item, line, r });
      }
      const unitPrices = allocateBundlePrices(
        resolved.map(({ item, r }) => ({ normalPrice: r.normalPrice, quantity: item.quantity })),
        Number(bundle.bundlePrice)
      );
      resolved.forEach(({ line, r }, i) => {
        priced.push({
          productId: r.product.id,
          variantId: r.variant?.id,
          unitRef: r.variant?.erpRef ?? undefined,
          productName: `${r.product.name} (pack ${bundle.name})`,
          variantName: r.variant?.name,
          unitPrice: unitPrices[i],
          quantity: line.quantity,
          isGift: false,
          bundleId: bundle.id,
        });
      });
    }
  }

  // ── Free gifts: one per gift category per phone bought in this order ──
  const phoneLines = priced.filter((l) => byId.get(l.productId)?.isPhone);
  const giftAllowance = new Map<string, number>(); // `${giftProductId}` → allowed via its category
  const categoryAllowance = new Map<string, number>();
  for (const line of phoneLines) {
    const phone = byId.get(line.productId)!;
    const categories = new Set(phone.compatibleAccessories.map((c) => c.product.categoryId));
    for (const c of categories) categoryAllowance.set(c, (categoryAllowance.get(c) ?? 0) + line.quantity);
    for (const c of phone.compatibleAccessories) giftAllowance.set(c.productId, 1);
  }
  for (const line of lines.filter((l) => l.isGift)) {
    if (!giftAllowance.has(line.productId)) {
      return fail("Un cadeau de votre panier ne correspond à aucun téléphone commandé. Merci de le retirer.");
    }
    const r = resolveLine(line);
    if ("error" in r) return fail(r.error!);
    const categoryId = r.product.categoryId;
    const left = (categoryAllowance.get(categoryId) ?? 0) - line.quantity;
    if (left < 0) return fail("Un seul cadeau par catégorie et par téléphone. Merci d'ajuster votre panier.");
    categoryAllowance.set(categoryId, left);
    priced.push({
      productId: r.product.id,
      variantId: r.variant?.id,
      productName: `${r.product.name} (cadeau offert)`,
      variantName: r.variant?.name,
      unitPrice: 0,
      quantity: line.quantity,
      isGift: true,
    });
  }

  const subtotal = priced.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const requiresAdvance = priced.some((l) => !l.isGift && byId.get(l.productId)?.isPhone);
  return { ok: true, lines: priced, subtotal, requiresAdvance, landingPageId: landingIds[0] };
}
