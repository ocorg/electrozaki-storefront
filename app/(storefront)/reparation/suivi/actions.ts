"use server";

import { allowRequest, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { findTrackedRepair, answerTrackedQuote, type TrackedRepair } from "@/lib/repair-tracking";

type Result = { ok: true; repair: TrackedRepair } | { ok: false; error: string };

const NOT_FOUND =
  "Aucune réparation trouvée avec ce numéro et ce téléphone. Vérifiez le numéro (ex : REP-0142) inscrit sur votre bon de dépôt.";

export async function lookupRepair(ref: string, phone: string): Promise<Result> {
  if (!(await allowRequest("track"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const repair = await findTrackedRepair(String(ref ?? ""), String(phone ?? ""));
  return repair ? { ok: true, repair } : { ok: false, error: NOT_FOUND };
}

export async function answerQuote(ref: string, phone: string, accept: boolean): Promise<Result> {
  if (!(await allowRequest("track"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const repair = await answerTrackedQuote(String(ref ?? ""), String(phone ?? ""), accept === true);
  return repair
    ? { ok: true, repair }
    : { ok: false, error: "Ce devis n'attend plus de réponse. Contactez-nous sur WhatsApp si besoin." };
}
