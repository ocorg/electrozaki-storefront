"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryInput,
} from "@/lib/db/categories";

type Result = { ok: true } | { ok: false; error: string };

export async function saveCategory(id: string | null, input: CategoryInput): Promise<Result> {
  await assertAdmin();

  if (!input.name.trim()) return { ok: false, error: "Le nom est requis." };
  if (!input.slug.trim()) return { ok: false, error: "Le slug est requis." };

  try {
    if (id) {
      await updateCategory(id, input);
    } else {
      await createCategory(input);
    }
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Unique constraint")) {
      return { ok: false, error: "Ce slug est déjà utilisé." };
    }
    return { ok: false, error: "Échec de l'enregistrement." };
  }
}

export async function removeCategory(id: string): Promise<Result> {
  await assertAdmin();
  const result = await deleteCategory(id);
  if (result.ok) {
    revalidatePath("/admin/categories");
    revalidatePath("/");
  }
  return result;
}
