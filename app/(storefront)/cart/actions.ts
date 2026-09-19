"use server";

import { put } from "@vercel/blob";
import { orderRequestSchema } from "@/lib/validation";
import { createOrderRequest, markWhatsAppOpened } from "@/lib/db/order-requests";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import type { CartItem } from "@/components/cart/CartContext";

type SubmitInput = {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  requiresAdvance: boolean;
  receiptUrl?: string;
  dataConsentAccepted: boolean;
};

type SubmitResult =
  | { ok: true; orderRequestId: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitOrderRequest(input: SubmitInput): Promise<SubmitResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Votre panier est vide." };
  }

  const parsed = orderRequestSchema.safeParse({
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    notes: input.notes,
    requiresAdvance: input.requiresAdvance,
    receiptUrl: input.receiptUrl,
    dataConsentAccepted: input.dataConsentAccepted,
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Certains champs sont invalides.",
    };
  }

  // The durable record — this is what makes the internal order-request
  // queue exist, independent of whether WhatsApp actually gets opened next.
  const order = await createOrderRequest({
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    deliveryAddress: parsed.data.deliveryAddress,
    notes: parsed.data.notes,
    requiresAdvance: parsed.data.requiresAdvance,
    receiptUrl: parsed.data.receiptUrl,
    dataConsentAccepted: parsed.data.dataConsentAccepted,
    items: input.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      productNameSnapshot: item.variantName
        ? `${item.productName} (${item.variantName})`
        : item.productName,
      priceAtRequest: item.price,
      quantity: item.quantity,
    })),
  });

  const whatsappUrl = buildWhatsAppOrderLink(
    parsed.data.customerName,
    input.items.map((item) => ({
      productName: item.productName,
      variantName: item.variantName,
      quantity: item.quantity,
      price: item.price,
    })),
    {
      deliveryAddress: parsed.data.deliveryAddress,
      requiresAdvance: parsed.data.requiresAdvance,
      receiptUploaded: Boolean(parsed.data.receiptUrl),
    }
  );

  return { ok: true, orderRequestId: order.id, whatsappUrl };
}

// Called client-side the moment the customer actually taps through to
// WhatsApp, so the admin queue can distinguish "submitted" from
// "customer also opened WhatsApp" at a glance.
export async function confirmWhatsAppOpened(orderRequestId: string): Promise<void> {
  await markWhatsAppOpened(orderRequestId);
}

type UploadResult = { ok: true; url: string } | { ok: false; error: string };

// Uploads the bank-transfer receipt to Vercel Blob and returns its public
// URL. Requires Vercel Blob storage enabled on the project (provides
// BLOB_READ_WRITE_TOKEN automatically) — see the setup note alongside this
// deliverable.
export async function uploadReceipt(formData: FormData): Promise<UploadResult> {
  const file = formData.get("receipt");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier sélectionné." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, error: "Fichier trop volumineux (5 Mo maximum)." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Le reçu doit être une image (JPG, PNG)." };
  }

  try {
    const blob = await put(`receipts/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false, error: "Échec de l'envoi du reçu. Réessayez." };
  }
}
