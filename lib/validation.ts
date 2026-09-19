import { z } from "zod";

// Accepts 06/07/05-style Moroccan mobile numbers, with or without +212,
// with or without spaces/dashes/dots between groups. Exported so other
// forms (repair request) validate phone numbers the same way.
export const MOROCCAN_PHONE_RE = /^(?:\+212|0)[\s.-]?[5-7](?:[\s.-]?\d){8}$/;

export const orderRequestSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Merci d'indiquer votre nom complet.")
    .max(120),
  customerPhone: z
    .string()
    .trim()
    .regex(MOROCCAN_PHONE_RE, "Numéro de téléphone invalide (ex: 06XXXXXXXX)."),
  deliveryAddress: z
    .string()
    .trim()
    .min(10, "Merci d'indiquer une adresse complète.")
    .max(300),
  notes: z.string().trim().max(500).optional(),
  requiresAdvance: z.boolean(),
  receiptUrl: z.string().url().optional(),
  dataConsentAccepted: z.boolean(),
}).refine((data) => !data.requiresAdvance || data.dataConsentAccepted, {
  message: "Merci d'accepter le traitement de vos données pour continuer.",
  path: ["dataConsentAccepted"],
}).refine((data) => !data.requiresAdvance || Boolean(data.receiptUrl), {
  message: "Merci de déposer votre reçu de virement avant de confirmer.",
  path: ["receiptUrl"],
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
