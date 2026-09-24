"use server";

import { z } from "zod";
import { allowRequest, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { MOROCCAN_PHONE_RE } from "@/lib/validation";
import { createRepairRequest } from "@/lib/db/repair";
import { PROBLEMS, type RepairKind } from "@/lib/repair-problems";

const repairRequestSchema = z
  .object({
    kind: z.enum(["HARDWARE", "SOFTWARE", "CONSULTATION"]),
    customerName: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
    customerPhone: z
      .string()
      .trim()
      .regex(MOROCCAN_PHONE_RE, "Numéro de téléphone invalide (ex: 06XXXXXXXX)."),
    deviceBrand: z.string().trim().max(60),
    deviceModel: z.string().trim().max(80),
    problemAreas: z.array(z.string()).min(1, "Sélectionnez au moins un problème.").max(7),
    preferredSlot: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  // Problems must belong to the chosen kind (the ERP relies on it).
  .refine((d) => d.problemAreas.every((p) => PROBLEMS[d.kind].some((x) => x.key === p)), {
    message: "Sélectionnez au moins un problème.",
    path: ["problemAreas"],
  })
  // A repair needs the device; a consultation doesn't, but needs the question.
  .refine((d) => d.kind === "CONSULTATION" || (d.deviceBrand.length > 0 && d.deviceModel.length > 0), {
    message: "Indiquez la marque et le modèle de l'appareil.",
    path: ["deviceModel"],
  })
  .refine((d) => d.kind !== "CONSULTATION" || (d.notes?.length ?? 0) >= 5, {
    message: "Décrivez votre question en quelques mots.",
    path: ["notes"],
  });

type RepairRequestInput = {
  kind: RepairKind;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  problemAreas: string[];
  preferredSlot?: string;
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
