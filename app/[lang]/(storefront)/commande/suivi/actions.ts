"use server";

import { allowRequest, RATE_LIMIT_MESSAGE, trackingPhoneLocked, recordTrackingFailure } from "@/lib/rate-limit";
import { findTrackedOrder, type TrackedOrder } from "@/lib/order-tracking";
import { errors as frErrors } from "@/lib/i18n/dictionaries/fr-errors";
import { saveReview, type ReviewInput } from "@/lib/reviews";
import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { LOCALES, isLocale } from "@/lib/i18n/config";
import { offerSlug } from "@/lib/offers/phone-offers";

type Result = { ok: true; order: TrackedOrder } | { ok: false; error: string };

// Same guards as the repair tracking: a few lookups per connection, and a
// phone number that keeps missing is locked for the day, so references
// can't be guessed. Messages stay French (the page translates them).
const LOCKED =
  "Trop d'essais pour ce numéro de téléphone aujourd'hui. Réessayez demain ou écrivez-nous sur WhatsApp avec votre numéro de demande.";

export async function lookupOrder(ref: string, phone: string): Promise<Result> {
  if (!(await allowRequest("track"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const cleanPhone = String(phone ?? "");
  if (cleanPhone.replace(/\D/g, "").length < 9) return { ok: false, error: frErrors.orderNotFound };
  if (await trackingPhoneLocked(cleanPhone)) return { ok: false, error: LOCKED };
  const order = await findTrackedOrder(String(ref ?? ""), cleanPhone);
  if (order) return { ok: true, order };
  await recordTrackingFailure(cleanPhone);
  return { ok: false, error: frErrors.orderNotFound };
}

// A delivered order's review, line by line. Same proof as the lookup (ref +
// phone, checked again here); then the pages showing that model's reviews
// are refreshed so it appears at once.
export async function submitReview(input: ReviewInput): Promise<{ ok: true; authorName: string } | { ok: false; error: string }> {
  if (!(await allowRequest("review"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const locale = isLocale(input?.locale) ? input.locale : "fr";
  const saved = await saveReview({ ...input, locale });
  if (!saved.ok) return saved;
  await refreshReviewedPages(saved);
  return { ok: true, authorName: saved.authorName };
}

async function refreshReviewedPages(target: { modelKey: string | null; productId: string }) {
  const products = await prisma.product.findMany({
    where: target.modelKey ? { modelKey: target.modelKey } : { id: target.productId },
    select: { slug: true },
  });
  for (const locale of LOCALES) {
    for (const p of products) revalidatePath(`/${locale}/products/${p.slug}`);
    if (target.modelKey) revalidatePath(`/${locale}/telephones/${offerSlug(target.modelKey)}`);
  }
}
