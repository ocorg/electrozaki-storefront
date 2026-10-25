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
  // Computed on the server from the priced cart — never taken from the form.
  requiresAdvance: z.boolean(),
  // Already verified against its server signature by the action.
  receiptKey: z.string().max(200).optional(),
  dataConsentAccepted: z.boolean(),
  // The terms of sale, ticked before every order (law 31-08, art. 30).
  termsAccepted: z.literal(true, { error: "Merci d'accepter les conditions générales de vente pour continuer." }),
// The 300 DH advance is arranged on the confirmation call (as on the phone
// pages): a receipt sent with the order is optional, and only then needs
// the customer's consent to its processing.
}).refine((data) => !data.receiptKey || data.dataConsentAccepted, {
  message: "Merci d'accepter le traitement de vos données pour continuer.",
  path: ["dataConsentAccepted"],
});

export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
