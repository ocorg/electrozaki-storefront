import { z } from "zod";

// Accepts 06/07/05-style Moroccan mobile numbers, with or without +212,
// with or without spaces/dashes/dots between groups.
const MOROCCAN_PHONE_RE = /^(?:\+212|0)[\s.-]?[5-7](?:[\s.-]?\d){8}$/;

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
  notes: z.string().trim().max(500).optional(),
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
