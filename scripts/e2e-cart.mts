// Checks that the server — not the browser — decides what an order costs.
// Runs lib/db/cart-pricing.ts directly against a TEST database branch
// (DATABASE_URL, filled by the ERP sync). Never against production.
//
//   npx tsx scripts/e2e-cart.mts
import "dotenv/config";
import { prisma } from "@/lib/db/client";
import { priceCart } from "@/lib/db/cart-pricing";
import { verifyReceiptToken } from "@/lib/storage";

const PRODUCTION_HOST = "ep-still-tree-b1u5yng9";
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes(PRODUCTION_HOST)) {
  console.error("DATABASE_URL must point at a Neon TEST branch, not production.");
  process.exit(1);
}

const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: unknown) =>
  results.push({ name, ok, detail: detail === undefined ? undefined : JSON.stringify(detail).slice(0, 300) });
const cleanups: (() => Promise<unknown>)[] = [];

try {
  // A used phone unit (single-unit variant) and a published accessory.
  const phone = await prisma.product.findFirst({
    where: { source: "ERP", isPhone: true, published: true, availability: "IN_STOCK", condition: { not: "NEUF" } },
    include: { variants: true },
  });
  const accessory = await prisma.product.findFirst({
    where: { source: "ERP", isPhone: false, availability: "IN_STOCK" },
    include: { internal: true },
  });
  if (!phone || !accessory) throw new Error("run the ERP sync on the test branch first");
  const unit = phone.variants[0];

  if (!accessory.published) {
    await prisma.product.update({ where: { id: accessory.id }, data: { published: true } });
    cleanups.push(() => prisma.product.update({ where: { id: accessory.id }, data: { published: false } }));
  }

  // 1. Prices come from the database, whatever the browser says
  const tampered = await priceCart([
    { productId: phone.id, variantId: unit.id, quantity: 1, price: 1 } as never,
  ]);
  check("price sent by the browser is ignored", tampered.ok && tampered.subtotal === Number(unit.priceOverride), tampered);
  check("a phone in the cart requires the 300 DH advance", tampered.ok && tampered.requiresAdvance === true);
  check("the order line keeps the unit's opaque reference", tampered.ok && tampered.lines[0].unitRef === unit.erpRef);

  const accOnly = await priceCart([{ productId: accessory.id, quantity: 1 }]);
  check("accessory-only order: no advance", accOnly.ok && accOnly.requiresAdvance === false, accOnly);

  // 2. A used phone is one unit
  const two = await priceCart([{ productId: phone.id, variantId: unit.id, quantity: 2 }]);
  check("can't order 2 of a single used phone", !two.ok, two);

  // 3. Variant required / must belong to the product
  const noVariant = await priceCart([{ productId: phone.id, quantity: 1 }]);
  check("phone without a chosen unit is refused", !noVariant.ok, noVariant);
  const foreign = await priceCart([{ productId: accessory.id, variantId: unit.id, quantity: 1 }]);
  check("a variant of another product is refused", !foreign.ok, foreign);

  // 4. Accessory stock
  const stock = accessory.internal?.stockQuantity ?? 0;
  if (stock < 20) {
    const tooMany = await priceCart([{ productId: accessory.id, quantity: stock + 1 }]);
    check("can't order more accessories than in stock", !tooMany.ok, { stock, tooMany });
  }

  // 5. Free gifts only with a phone that offers them
  const loneGift = await priceCart([{ productId: accessory.id, quantity: 1, isGift: true }]);
  check("a 'gift' without its phone is refused", !loneGift.ok, loneGift);

  await prisma.productCompatibility.upsert({
    where: { productId_compatibleWithId: { productId: accessory.id, compatibleWithId: phone.id } },
    create: { productId: accessory.id, compatibleWithId: phone.id, isGiftOption: true },
    update: { isGiftOption: true },
  });
  cleanups.push(() => prisma.productCompatibility.deleteMany({ where: { productId: accessory.id, compatibleWithId: phone.id } }));
  const withGift = await priceCart([
    { productId: phone.id, variantId: unit.id, quantity: 1 },
    { productId: accessory.id, quantity: 1, isGift: true },
  ]);
  check("a gift with its phone is free", withGift.ok && withGift.lines.find((l) => l.isGift)?.unitPrice === 0, withGift);
  const twoGifts = await priceCart([
    { productId: phone.id, variantId: unit.id, quantity: 1 },
    { productId: accessory.id, quantity: 2, isGift: true },
  ]);
  check("only one gift per category per phone", !twoGifts.ok, twoGifts);

  // 6. Hidden products can't be ordered
  await prisma.product.update({ where: { id: accessory.id }, data: { published: false } });
  const hidden = await priceCart([{ productId: accessory.id, quantity: 1 }]);
  check("a hidden product can't be ordered", !hidden.ok, hidden);
  await prisma.product.update({ where: { id: accessory.id }, data: { published: true } });

  // 7. Packs: exact composition, server price
  const other = await prisma.product.findFirst({
    where: { source: "ERP", isPhone: false, id: { not: accessory.id }, availability: "IN_STOCK" },
  });
  if (other) {
    if (!other.published) {
      await prisma.product.update({ where: { id: other.id }, data: { published: true } });
      cleanups.push(() => prisma.product.update({ where: { id: other.id }, data: { published: false } }));
    }
    const bundle = await prisma.bundle.create({
      data: {
        name: "E2E pack", slug: `e2e-pack-${Date.now()}`, bundlePrice: 10, active: true,
        items: { create: [{ productId: accessory.id, quantity: 1 }, { productId: other.id, quantity: 1 }] },
      },
    });
    cleanups.push(() => prisma.bundle.delete({ where: { id: bundle.id } }));
    const pack = await priceCart([
      { productId: accessory.id, quantity: 1, bundleId: bundle.id },
      { productId: other.id, quantity: 1, bundleId: bundle.id },
    ]);
    check("pack lines add up to the pack price", pack.ok && pack.subtotal === 10, pack);
    const half = await priceCart([{ productId: accessory.id, quantity: 1, bundleId: bundle.id }]);
    check("half a pack at the pack price is refused", !half.ok, half);
  }

  // 8. Receipts: only keys this server signed
  check("receipt: random key refused", !verifyReceiptToken("receipts/123-abc.webp", "forged"));
  check("receipt: path tricks refused", !verifyReceiptToken("../secret.webp", "x"));

  // 9. Empty / oversized carts
  check("empty cart refused", !(await priceCart([])).ok);
  const huge = await priceCart(Array.from({ length: 31 }, () => ({ productId: accessory.id, quantity: 1 })));
  check("cart with too many lines refused", !huge.ok);
} catch (err) {
  check("script ran to the end", false, String((err as Error)?.stack ?? err));
} finally {
  for (const fn of cleanups.reverse()) {
    try { await fn(); } catch (e) { console.error("cleanup:", (e as Error).message); }
  }
  await prisma.$disconnect();
}

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  → ${r.detail}`}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
