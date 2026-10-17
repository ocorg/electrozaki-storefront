"use server";

import { allowRequest, RATE_LIMIT_MESSAGE, trackingPhoneLocked, recordTrackingFailure } from "@/lib/rate-limit";
import { findTrackedOrder, type TrackedOrder } from "@/lib/order-tracking";
import { errors as frErrors } from "@/lib/i18n/dictionaries/fr-errors";

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
