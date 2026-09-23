"use server";

import { z } from "zod";
import { allowRequest, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { MOROCCAN_PHONE_RE } from "@/lib/validation";
import { createRepairRequest } from "@/lib/db/repair";

const repairRequestSchema = z.object({
  customerName: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
  customerPhone: z
    .string()
    .trim()
    .regex(MOROCCAN_PHONE_RE, "Numéro de téléphone invalide (ex: 06XXXXXXXX)."),
  deviceBrand: z.string().trim().min(1, "Choisissez une marque.").max(60),
  deviceModel: z.string().trim().min(1, "Indiquez le modèle.").max(80),
  problemAreas: z
    .array(z.enum(["ecran", "batterie", "camera", "connecteur", "son", "reseau"]))
    .min(1, "Sélectionnez au moins un problème.")
    .max(6),
  notes: z.string().trim().max(500).optional(),
});

type RepairRequestInput = {
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  problemAreas: string[];
  notes?: string;
};

type Result = { ok: true } | { ok: false; error: string };

export async function submitRepairRequest(input: RepairRequestInput): Promise<Result> {
  if (!(await allowRequest("repair"))) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const parsed = repairRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  await createRepairRequest(parsed.data);
  return { ok: true };
}
