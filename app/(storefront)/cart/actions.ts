"use server";

import { uploadReceiptImage, verifyReceiptToken } from "@/lib/storage";
import { orderRequestSchema } from "@/lib/validation";
import { createOrderRequest, markWhatsAppOpened, PromoExhaustedError } from "@/lib/db/order-requests";
import { priceCart, type CartLineInput } from "@/lib/db/cart-pricing";
import { validatePromoCode, type PromoValidationResult } from "@/lib/db/promo-codes";
import { allowRequest, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";

type SubmitInput = {
  // Only product/variant ids, quantities and the gift/pack markers are read
  // from these lines — any price the browser sends along is ignored.
  items: CartLineInput[];
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;
  receipt?: { key: string; token: string };
  dataConsentAccepted: boolean;
  promoCode?: string;
};

// Called when the customer clicks "Appliquer" in the cart, purely to show
// them the discount before they commit. The total is computed on the
// server; submitOrderRequest re-validates the same code from scratch.
export async function applyPromoCode(
  code: string,
  items: CartLineInput[]
): Promise<PromoValidationResult> {
  if (!(await allowRequest("promo"))) return { ok: false, error: RATE_LIMIT_MESSAGE };
  const cart = await priceCart(items);
  if (!cart.ok) return { ok: false, error: cart.error };
  return validatePromoCode(String(code ?? ""), cart.subtotal);
}

type SubmitResult =
  | { ok: true; orderRequestId: string; whatsappUrl: string }
  | { ok: false; error: string };

export async function submitOrderRequest(input: SubmitInput): Promise<SubmitResult> {
  if (!(await allowRequest("order"))) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const cart = await priceCart(input.items);
  if (!cart.ok) return { ok: false, error: cart.error };

  let promoCodeId: string | undefined;
  let discountAmount = 0;
  if (input.promoCode) {
    const promoResult = await validatePromoCode(String(input.promoCode), cart.subtotal);
    if (!promoResult.ok) return { ok: false, error: promoResult.error };
    promoCodeId = promoResult.promoCodeId;
    discountAmount = promoResult.discountAmount;
  }

  let receiptKey: string | undefined;
  if (input.receipt) {
    if (!verifyReceiptToken(String(input.receipt.key), String(input.receipt.token))) {
      return { ok: false, error: "Reçu invalide. Merci de le déposer à nouveau." };
    }
    receiptKey = input.receipt.key;
  }

  const parsed = orderRequestSchema.safeParse({
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    deliveryAddress: input.deliveryAddress,
    notes: input.notes,
    requiresAdvance: cart.requiresAdvance,
    receiptKey,
    dataConsentAccepted: input.dataConsentAccepted === true,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Certains champs sont invalides." };
  }

  let order;
  try {
    order = await createOrderRequest({
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      deliveryAddress: parsed.data.deliveryAddress,
      notes: parsed.data.notes,
      requiresAdvance: parsed.data.requiresAdvance,
      receiptKey: parsed.data.receiptKey,
      dataConsentAccepted: parsed.data.dataConsentAccepted,
      promoCodeId,
      discountAmount,
      lines: cart.lines,
    });
  } catch (err) {
    if (err instanceof PromoExhaustedError) {
      return { ok: false, error: "Ce code a atteint sa limite d'utilisation." };
    }
    throw err;
  }

  const whatsappUrl = buildWhatsAppOrderLink(
    parsed.data.customerName,
    cart.lines.map((l) => ({
      productName: l.productName,
      variantName: l.variantName,
      quantity: l.quantity,
      price: l.unitPrice,
    })),
    {
      reference: order.id.slice(0, 8).toUpperCase(),
      deliveryAddress: parsed.data.deliveryAddress,
      requiresAdvance: parsed.data.requiresAdvance,
      receiptUploaded: Boolean(parsed.data.receiptKey),
      discountAmount,
    }
  );

  return { ok: true, orderRequestId: order.id, whatsappUrl };
}

// Called client-side the moment the customer actually taps through to
// WhatsApp, so the staff queue can distinguish "submitted" from
// "customer also opened WhatsApp" at a glance.
export async function confirmWhatsAppOpened(orderRequestId: string): Promise<void> {
  await markWhatsAppOpened(String(orderRequestId));
}

type UploadResult = { ok: true; key: string; token: string } | { ok: false; error: string };

// Stored in the private receipts bucket — see lib/storage.ts.
export async function uploadReceipt(formData: FormData): Promise<UploadResult> {
  if (!(await allowRequest("upload"))) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier sélectionné." };
  }
  return uploadReceiptImage(file);
}
