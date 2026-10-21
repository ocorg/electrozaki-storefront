import { prisma } from "@/lib/db/client";
import { cleanOrderRef, isOrderRef } from "@/lib/order-tracking";
import { errors as frErrors } from "@/lib/i18n/dictionaries/fr-errors";
import type { Locale } from "@/lib/i18n/config";

// ─────────────────────────────────────────────────────────────────────────
// Customer reviews (see ProductReview in prisma/schema.prisma).
// Written from the order tracking page by a customer whose order was
// delivered; read by the product and model pages, and given to Google as
// the product's rating (aggregateRating + review).
// ─────────────────────────────────────────────────────────────────────────

export const COMMENT_MAX = 1000;
export const NAME_MAX = 40;

export type PublicReview = {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string;
  productName: string;
  /** ISO date */
  createdAt: string;
  locale: string;
};

export type ReviewSummary = {
  count: number;
  /** 1 decimal */
  average: number;
  /** count per star, index 0 = 1 star */
  histogram: number[];
  /** the latest ones, newest first */
  latest: PublicReview[];
};

/** "mohamed el amrani" → "Mohamed E." — never a full name on the site. */
export function displayName(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  const cap = (w: string) => w.charAt(0).toLocaleUpperCase("fr") + w.slice(1).toLocaleLowerCase("fr");
  const first = cap(words[0]).slice(0, NAME_MAX);
  return words[1] ? `${first} ${words[1].charAt(0).toLocaleUpperCase("fr")}.` : first;
}

/**
 * The reviews shown for a listing: every review of the phone model (all its
 * storages and grades), or of the product itself when it has no model.
 */
export async function getReviewSummary(target: { modelKey: string | null; productId?: string }, take = 8): Promise<ReviewSummary | null> {
  const where = target.modelKey
    ? { modelKey: target.modelKey, hidden: false }
    : target.productId
      ? { productId: target.productId, hidden: false }
      : null;
  if (!where) return null;
  const [groups, latest] = await Promise.all([
    prisma.productReview.groupBy({ by: ["rating"], where, _count: { _all: true } }),
    prisma.productReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: { id: true, rating: true, comment: true, authorName: true, productName: true, createdAt: true, locale: true },
    }),
  ]);
  const histogram = [0, 0, 0, 0, 0];
  for (const g of groups) if (g.rating >= 1 && g.rating <= 5) histogram[g.rating - 1] = g._count._all;
  const count = histogram.reduce((a, b) => a + b, 0);
  if (!count) return null;
  const sum = histogram.reduce((a, n, i) => a + n * (i + 1), 0);
  return {
    count,
    average: Math.round((sum / count) * 10) / 10,
    histogram,
    latest: latest.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
  };
}

/** schema.org fields for a Product: its rating and a few reviews. */
export function reviewJsonLd(summary: ReviewSummary | null): Record<string, unknown> {
  if (!summary) return {};
  return {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(summary.average),
      reviewCount: summary.count,
      bestRating: "5",
      worstRating: "1",
    },
    review: summary.latest.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.authorName },
      datePublished: r.createdAt.slice(0, 10),
      reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
      ...(r.comment ? { reviewBody: r.comment } : {}),
    })),
  };
}

// ── Writing ─────────────────────────────────────────────────────────────

export type ReviewInput = {
  ref: string;
  phone: string;
  itemId: string;
  rating: number;
  comment: string;
  name: string;
  locale: Locale;
};

type SaveResult = { ok: true; modelKey: string | null; productId: string; authorName: string } | { ok: false; error: string };

const lastDigits = (phone: string) => phone.replace(/\D/g, "").slice(-9);
// Links are how review spam advertises; a customer's opinion needs none.
const LINK_RE = /(https?:\/\/|www\.)/i;

/**
 * Saves (or updates) the review of one order line. The customer proves the
 * order is theirs with its reference and phone, like on the tracking page;
 * the order must be delivered and the line not a free gift.
 */
export async function saveReview(input: ReviewInput): Promise<SaveResult> {
  const ref = cleanOrderRef(String(input.ref ?? ""));
  const phone = String(input.phone ?? "");
  if (!isOrderRef(ref) || lastDigits(phone).length < 9) return { ok: false, error: frErrors.orderNotFound };

  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) return { ok: false, error: frErrors.reviewPickStars };
  const comment = String(input.comment ?? "").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (comment.length > COMMENT_MAX) return { ok: false, error: frErrors.reviewTooLong };
  if (LINK_RE.test(comment)) return { ok: false, error: frErrors.reviewNoLinks };

  const item = await prisma.orderRequestItem.findFirst({
    where: { id: String(input.itemId ?? ""), orderRequest: { id: { startsWith: ref.toLowerCase() } } },
    select: {
      id: true,
      isGift: true,
      productId: true,
      productNameSnapshot: true,
      product: { select: { modelKey: true } },
      orderRequest: { select: { customerPhone: true, customerName: true, status: true, shippingStatus: true } },
    },
  });
  if (!item || lastDigits(item.orderRequest.customerPhone) !== lastDigits(phone)) return { ok: false, error: frErrors.orderNotFound };
  const order = item.orderRequest;
  if (item.isGift || order.status === "CANCELLED" || order.shippingStatus !== "DELIVERED") {
    return { ok: false, error: frErrors.reviewNotDelivered };
  }

  const name = displayName(String(input.name ?? "")) || displayName(order.customerName);
  if (name.length < 2) return { ok: false, error: frErrors.yourName };

  const data = {
    rating,
    comment: comment || null,
    authorName: name,
    locale: input.locale,
  };
  await prisma.productReview.upsert({
    where: { orderItemId: item.id },
    create: {
      ...data,
      orderItemId: item.id,
      productId: item.productId,
      modelKey: item.product.modelKey,
      productName: item.productNameSnapshot,
    },
    // An edit doesn't bring back a review staff have hidden.
    update: data,
  });
  return { ok: true, modelKey: item.product.modelKey, productId: item.productId, authorName: name };
}
