"use server";

import { z } from "zod";
import { MOROCCAN_PHONE_RE } from "@/lib/validation";
import { createRepairRequest } from "@/lib/db/repair";

const repairRequestSchema = z.object({
  customerName: z.string().trim().min(2, "Merci d'indiquer votre nom."),
  customerPhone: z
    .string()
    .trim()
    .regex(MOROCCAN_PHONE_RE, "Numéro de téléphone invalide (ex: 06XXXXXXXX)."),
  deviceBrand: z.string().trim().min(1, "Choisissez une marque."),
  deviceModel: z.string().trim().min(1, "Indiquez le modèle."),
  problemAreas: z.array(z.string()).min(1, "Sélectionnez au moins un problème."),
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
  const parsed = repairRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  await createRepairRequest(parsed.data);
  return { ok: true };
}
