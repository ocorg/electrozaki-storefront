"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import {
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  type PromoCodeInput,
} from "@/lib/db/promo-codes";

type Result = { ok: true } | { ok: false; error: string };

export async function savePromoCode(id: string | null, input: PromoCodeInput): Promise<Result> {
  await assertAdmin();

  if (!input.code.trim()) return { ok: false, error: "Le code est requis." };
  if (input.value <= 0) return { ok: false, error: "La valeur doit être positive." };

  try {
    if (id) {
      await updatePromoCode(id, input);
    } else {
      await createPromoCode(input);
    }
    revalidatePath("/admin/promo-codes");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Unique constraint")) {
      return { ok: false, error: "Ce code existe déjà." };
    }
    return { ok: false, error: "Échec de l'enregistrement." };
  }
}

export async function removePromoCode(id: string): Promise<void> {
  await assertAdmin();
  await deletePromoCode(id);
  revalidatePath("/admin/promo-codes");
}
