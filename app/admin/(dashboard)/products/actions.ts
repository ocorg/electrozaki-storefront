"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/admin-auth";
import { uploadImage, IMAGE_PRESETS } from "@/lib/storage";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from "@/lib/db/admin-products";

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

// Resized to 1200px max, converted to WebP, and uploaded to Cloudflare R2
// — see lib/storage.ts. This site has no zoom feature and never displays
// a product photo larger than a few hundred px, so there's no benefit to
// storing anything bigger.
export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  await assertAdmin();

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier sélectionné." };
  }

  return uploadImage(file, "products", IMAGE_PRESETS.product);
}

type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function saveProduct(id: string | null, input: ProductInput): Promise<SaveResult> {
  await assertAdmin();

  if (!input.name.trim()) return { ok: false, error: "Le nom est requis." };
  if (!input.slug.trim()) return { ok: false, error: "Le slug est requis." };
  if (!input.categoryId) return { ok: false, error: "Choisissez une catégorie." };
  if (input.recommendedSalePrice <= 0) return { ok: false, error: "Le prix doit être positif." };

  try {
    if (id) {
      await updateProduct(id, input);
      revalidatePath("/admin/products");
      revalidatePath(`/products/${input.slug}`);
      return { ok: true, id };
    }
    const product = await createProduct(input);
    revalidatePath("/admin/products");
    return { ok: true, id: product.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue.";
    if (message.includes("Unique constraint")) {
      return { ok: false, error: "Ce slug est déjà utilisé par un autre produit." };
    }
    return { ok: false, error: "Échec de l'enregistrement du produit." };
  }
}

export async function removeProduct(id: string): Promise<void> {
  await assertAdmin();
  await deleteProduct(id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
