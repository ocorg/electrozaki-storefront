"use server";

import { orderRequestSchema } from "@/lib/validation";
import { createOrderRequest, markWhatsAppOpened } from "@/lib/db/order-requests";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import type { CartItem } from "@/components/cart/CartContext";

type SubmitInput = {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  notes?: string;
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
    notes: input.notes,
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
    notes: parsed.data.notes,
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
    }))
  );

  return { ok: true, orderRequestId: order.id, whatsappUrl };
}

// Called client-side the moment the customer actually taps through to
// WhatsApp, so the admin queue can distinguish "submitted" from
// "customer also opened WhatsApp" at a glance.
export async function confirmWhatsAppOpened(orderRequestId: string): Promise<void> {
  await markWhatsAppOpened(orderRequestId);
}
