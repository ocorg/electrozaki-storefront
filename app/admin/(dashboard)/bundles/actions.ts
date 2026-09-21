"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import { createBundle, updateBundle, deleteBundle, type BundleInput } from "@/lib/db/bundles";

type Result = { ok: true } | { ok: false; error: string };

export async function saveBundle(id: string | null, input: BundleInput): Promise<Result> {
  await assertAdmin();

  if (!input.name.trim()) return { ok: false, error: "Le nom est requis." };
  if (!input.slug.trim()) return { ok: false, error: "Le slug est requis." };
  if (input.bundlePrice <= 0) return { ok: false, error: "Le prix du pack doit être positif." };
  if (input.items.length < 2) return { ok: false, error: "Un pack doit contenir au moins 2 produits." };

  try {
    if (id) {
      await updateBundle(id, input);
    } else {
      await createBundle(input);
    }
    revalidatePath("/admin/bundles");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Unique constraint")) {
      return { ok: false, error: "Ce slug existe déjà." };
    }
    return { ok: false, error: "Échec de l'enregistrement." };
  }
}

export async function removeBundle(id: string): Promise<void> {
  await assertAdmin();
  await deleteBundle(id);
  revalidatePath("/admin/bundles");
}
