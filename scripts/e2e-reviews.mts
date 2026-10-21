// Customer reviews (lib/reviews.ts) and the tracking page's review data
// (lib/order-tracking.ts) against a TEST database branch. Never production.
//   npx tsx scripts/e2e-reviews.mts
import "dotenv/config";
import { prisma } from "@/lib/db/client";
import { findTrackedOrder } from "@/lib/order-tracking";
import { getReviewSummary, reviewJsonLd, saveReview, displayName } from "@/lib/reviews";

const PRODUCTION_HOST = "ep-still-tree-b1u5yng9";
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes(PRODUCTION_HOST)) {
  console.error("DATABASE_URL must point at a Neon TEST branch, not production.");
  process.exit(1);
}

const results: { name: string; ok: boolean; detail?: string }[] = [];
const check = (name: string, ok: boolean, detail?: unknown) =>
  results.push({ name, ok, detail: detail === undefined ? undefined : JSON.stringify(detail) });

const PHONE = "0661234567";

async function main() {
  const orderIds: string[] = [];
  try {
    const phone = await prisma.product.findFirst({ where: { isPhone: true, modelKey: { not: null } }, select: { id: true, name: true, modelKey: true } });
    const other = await prisma.product.findFirst({ where: { NOT: { id: phone?.id } }, select: { id: true, name: true } });
    if (!phone || !other) throw new Error("the test branch needs a phone with a modelKey and another product");

    const order = await prisma.orderRequest.create({
      data: {
        customerName: "mohamed el amrani",
        customerPhone: PHONE,
        totalEstimate: 3000,
        status: "CONFIRMED",
        shippingStatus: "IN_TRANSIT",
        items: {
          create: [
            { productId: phone.id, productNameSnapshot: phone.name, priceAtRequest: 3000 },
            { productId: other.id, productNameSnapshot: other.name, priceAtRequest: 0, isGift: true },
          ],
        },
      },
      include: { items: { orderBy: { id: "asc" } } },
    });
    orderIds.push(order.id);
    const ref = order.id.slice(0, 8).toUpperCase();
    const phoneLine = order.items.find((i) => !i.isGift)!;
    const giftLine = order.items.find((i) => i.isGift)!;
    const base = { ref, phone: PHONE, itemId: phoneLine.id, rating: 5, comment: "Très bon téléphone, batterie à 89 %.", name: "", locale: "fr" as const };

    check("display name keeps first name + initial", displayName("mohamed el amrani") === "Mohamed E." && displayName("  sara ") === "Sara");

    let tracked = await findTrackedOrder(ref, PHONE);
    check("not delivered yet → nothing to review", !!tracked && tracked.items.every((i) => !i.reviewable), tracked?.items);
    const early = await saveReview(base);
    check("review refused before delivery", !early.ok, early);

    await prisma.orderRequest.update({ where: { id: order.id }, data: { shippingStatus: "DELIVERED" } });
    tracked = await findTrackedOrder(ref, PHONE);
    const lines = tracked?.items ?? [];
    check(
      "delivered → the phone is reviewable, the free gift isn't",
      lines.find((i) => i.id === phoneLine.id)?.reviewable === true && lines.find((i) => i.id === giftLine.id)?.reviewable === false,
      lines,
    );
    check("suggested name on the tracking page", tracked?.reviewName === "Mohamed E.", tracked?.reviewName);

    check("wrong phone → refused", !(await saveReview({ ...base, phone: "0700000000" })).ok);
    check("wrong reference → refused", !(await saveReview({ ...base, ref: "ZZZZZZZZ" })).ok);
    check("gift line → refused", !(await saveReview({ ...base, itemId: giftLine.id })).ok);
    check("no stars → refused", !(await saveReview({ ...base, rating: 0 })).ok);
    check("6 stars → refused", !(await saveReview({ ...base, rating: 6 })).ok);
    check("a link → refused", !(await saveReview({ ...base, comment: "promo sur https://spam.example" })).ok);
    check("too long → refused", !(await saveReview({ ...base, comment: "a".repeat(1001) })).ok);

    const saved = await saveReview(base);
    check("valid review saved, name from the order", saved.ok && saved.authorName === "Mohamed E.", saved);
    const row = await prisma.productReview.findUnique({ where: { orderItemId: phoneLine.id } });
    check("stored with the model and product name", row?.modelKey === phone.modelKey && row?.productName === phone.name && row?.rating === 5, row);

    const edited = await saveReview({ ...base, rating: 4, comment: "", name: "sara b" });
    const rows = await prisma.productReview.findMany({ where: { orderItemId: phoneLine.id } });
    check("editing updates the same review", edited.ok && rows.length === 1 && rows[0].rating === 4 && rows[0].comment === null && rows[0].authorName === "Sara B.", rows);

    tracked = await findTrackedOrder(ref, PHONE);
    check("tracking page shows the customer's review", tracked?.items.find((i) => i.id === phoneLine.id)?.review?.rating === 4);

    const summary = await getReviewSummary({ modelKey: phone.modelKey });
    check("model summary counts it", !!summary && summary.count >= 1 && summary.latest.some((r) => r.id === rows[0].id), summary);
    const ld = reviewJsonLd(summary) as { aggregateRating?: { reviewCount: number } };
    check("structured data has aggregateRating", ld.aggregateRating?.reviewCount === summary?.count, ld);

    await prisma.productReview.update({ where: { id: rows[0].id }, data: { hidden: true } });
    const afterHide = await getReviewSummary({ modelKey: phone.modelKey });
    check("hidden review is no longer shown", !afterHide || !afterHide.latest.some((r) => r.id === rows[0].id));
    await saveReview({ ...base, rating: 1 });
    check("an edit doesn't un-hide it", (await prisma.productReview.findUnique({ where: { id: rows[0].id } }))?.hidden === true);

    check("no reviews → no structured data", Object.keys(reviewJsonLd(null)).length === 0);
  } catch (err) {
    check("script ran to the end", false, String((err as Error)?.stack ?? err));
  } finally {
    // Reviews go with their order lines (cascade).
    await prisma.orderRequest.deleteMany({ where: { id: { in: orderIds } } });
    await prisma.$disconnect();
  }
  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : `  → ${r.detail}`}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
}

main();
