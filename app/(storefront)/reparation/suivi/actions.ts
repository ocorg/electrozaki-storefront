"use server";

import { allowRequest, RATE_LIMIT_MESSAGE, trackingPhoneLocked, recordTrackingFailure } from "@/lib/rate-limit";
import {
  findTrackedRepair,
  answerTrackedQuote,
  cleanTrackingRef,
  isTrackingRef,
  type TrackedRepair,
} from "@/lib/repair-tracking";

type Result = { ok: true; repair: TrackedRepair } | { ok: false; error: string };

const NOT_FOUND =
  "Aucune demande ou réparation trouvée avec ce numéro et ce téléphone. Vérifiez le numéro : DEM-… (reçu en ligne) ou REP-… (bon de dépôt).";
const LOCKED =
  "Trop d'essais pour ce numéro de téléphone aujourd'hui. Réessayez demain ou écrivez-nous sur WhatsApp avec votre numéro de demande.";

export async function lookupRepair(ref: string, phone: string): Promise<Result> {
  if (!(await allowRequest("track"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const cleanRef = cleanTrackingRef(String(ref ?? ""));
  const cleanPhone = String(phone ?? "");
  if (!isTrackingRef(cleanRef) || cleanPhone.replace(/\D/g, "").length < 9) return { ok: false, error: NOT_FOUND };
  if (await trackingPhoneLocked(cleanPhone)) return { ok: false, error: LOCKED };
  const repair = await findTrackedRepair(cleanRef, cleanPhone);
  if (repair) return { ok: true, repair };
  await recordTrackingFailure(cleanPhone);
  return { ok: false, error: NOT_FOUND };
}

export async function answerQuote(ref: string, phone: string, accept: boolean): Promise<Result> {
  if (!(await allowRequest("track"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  // Same guard as the lookup, or this would be a way around the per-phone cap.
  const cleanPhone = String(phone ?? "");
  if (cleanPhone.replace(/\D/g, "").length < 9) return { ok: false, error: NOT_FOUND };
  if (await trackingPhoneLocked(cleanPhone)) return { ok: false, error: LOCKED };
  if (!(await findTrackedRepair(String(ref ?? ""), cleanPhone))) {
    await recordTrackingFailure(cleanPhone);
    return { ok: false, error: NOT_FOUND };
  }
  const repair = await answerTrackedQuote(String(ref ?? ""), cleanPhone, accept === true);
  return repair
    ? { ok: true, repair }
    : { ok: false, error: "Ce devis n'attend plus de réponse. Contactez-nous sur WhatsApp si besoin." };
}
