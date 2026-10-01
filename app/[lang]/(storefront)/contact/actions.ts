"use server";

import { z } from "zod";
import { allowRequest, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { createContactMessage } from "@/lib/db/contact";

const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
    phone: z.string().trim().max(30).optional(),
    email: z
      .string()
      .trim()
      .email("Email invalide.")
      .optional()
      .or(z.literal("")),
    message: z.string().trim().min(5, "Le message est trop court.").max(2000),
  })
  .refine((data) => Boolean(data.phone) || Boolean(data.email), {
    message: "Merci d'indiquer un téléphone ou un email pour qu'on puisse vous répondre.",
    path: ["phone"],
  });

type ContactInput = {
  name: string;
  phone?: string;
  email?: string;
  message: string;
};

type Result = { ok: true } | { ok: false; error: string };

export async function submitContactMessage(input: ContactInput): Promise<Result> {
  if (!(await allowRequest("contact"))) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Champs invalides." };
  }

  await createContactMessage({
    name: parsed.data.name,
    phone: parsed.data.phone || undefined,
    email: parsed.data.email || undefined,
    message: parsed.data.message,
  });

  return { ok: true };
}
