"use server";

import { uploadImage, IMAGE_PRESETS } from "@/lib/storage";
import { orderRequestSchema } from "@/lib/validation";
import { createOrderRequest, markWhatsAppOpened } from "@/lib/db/order-requests";
import { validatePromoCode, type PromoValidationResult } from "@/lib/db/promo-codes";
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
  promoCode?: string;
};

// Called when the customer clicks "Appliquer" in the cart, purely to show
// them the discount before they commit. submitOrderRequest re-validates
// the same code from scratch at submission time — see the comment there.
export async function applyPromoCode(code: string, cartTotal: number): Promise<PromoValidationResult> {
  return validatePromoCode(code, cartTotal);
}

type SubmitResult =
  | { ok: true; orderRequestId: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitOrderRequest(input: SubmitInput): Promise<SubmitResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "Votre panier est vide." };
  }

  const subtotal = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Re-validate the promo code against the real, server-computed subtotal
  // rather than trusting whatever the cart page displayed — the code could
  // have expired, hit its redemption cap, or been deactivated in the
  // minutes between "Appliquer" and "Confirmer ma commande".
  let promoCodeId: string | undefined;
  let discountAmount = 0;
  if (input.promoCode) {
    const promoResult = await validatePromoCode(input.promoCode, subtotal);
    if (!promoResult.ok) {
      return { ok: false, error: promoResult.error };
    }
    promoCodeId = promoResult.promoCodeId;
    discountAmount = promoResult.discountAmount;
  }

  const parsed = orderRequestSchema.safeParse({
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    notes: input.notes,
    requiresAdvance: input.requiresAdvance,
    receiptUrl: input.receiptUrl,
    dataConsentAccepted: input.dataConsentAccepted,
    promoCodeId,
    discountAmount,
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
    promoCodeId: parsed.data.promoCodeId,
    discountAmount: parsed.data.discountAmount,
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
      discountAmount,
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

// Resized, compressed to WebP, and uploaded to Cloudflare R2 — see
// lib/storage.ts. The "receipt" preset keeps more resolution/quality than
// the product-photo preset so a bank transfer receipt's fine print stays
// legible.
export async function uploadReceipt(formData: FormData): Promise<UploadResult> {
  const file = formData.get("receipt");

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier sélectionné." };
  }

  return uploadImage(file, "receipts", IMAGE_PRESETS.receipt);
}
