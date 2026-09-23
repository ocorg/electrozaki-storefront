import { AdvancePaymentStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

import type { PricedLine } from "./cart-pricing";

type OrderRequestInput = {
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  notes?: string;
  requiresAdvance: boolean;
  receiptKey?: string;
  dataConsentAccepted: boolean;
  // Server-priced lines from priceCart() — never the browser's own prices.
  lines: PricedLine[];
  // Locked in at submission time — see the schema comment on OrderRequest.
  promoCodeId?: string;
  discountAmount?: number;
};

export class PromoExhaustedError extends Error {}

// Called from the cart submit action. Creates the durable record that both
// feeds the internal queue and supplies the numbers used to build the
// WhatsApp prefill message.
export async function createOrderRequest(input: OrderRequestInput) {
  const subtotal = input.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const discountAmount = input.discountAmount ?? 0;
  const totalEstimate = Math.max(0, subtotal - discountAmount);

  // Phase-2 payment status: only meaningful when the order actually
  // requires the advance.
  const advancePaymentStatus: AdvancePaymentStatus = !input.requiresAdvance
    ? AdvancePaymentStatus.NOT_REQUIRED
    : input.receiptKey
      ? AdvancePaymentStatus.RECEIPT_UPLOADED
      : AdvancePaymentStatus.AWAITING_RECEIPT;

  return prisma.$transaction(async (tx) => {
    if (input.promoCodeId) {
      // Conditional increment: two simultaneous orders can't both use the
      // last redemption of a capped code.
      const promo = await tx.promoCode.findUnique({
        where: { id: input.promoCodeId },
        select: { maxRedemptions: true },
      });
      const claimed = await tx.promoCode.updateMany({
        where: {
          id: input.promoCodeId,
          ...(promo?.maxRedemptions != null ? { redemptionCount: { lt: promo.maxRedemptions } } : {}),
        },
        data: { redemptionCount: { increment: 1 } },
      });
      if (claimed.count === 0) throw new PromoExhaustedError();
    }

    return tx.orderRequest.create({
      data: {
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        deliveryAddress: input.deliveryAddress,
        notes: input.notes,
        totalEstimate,
        requiresAdvance: input.requiresAdvance,
        advancePaymentStatus,
        receiptKey: input.receiptKey,
        receiptUploadedAt: input.receiptKey ? new Date() : undefined,
        dataConsentAccepted: input.dataConsentAccepted,
        promoCodeId: input.promoCodeId,
        discountAmount,
        items: {
          create: input.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId,
            unitRef: l.unitRef,
            isGift: l.isGift,
            bundleId: l.bundleId,
            productNameSnapshot: l.variantName ? `${l.productName} (${l.variantName})` : l.productName,
            priceAtRequest: l.unitPrice,
            quantity: l.quantity,
          })),
        },
      },
      include: { items: true },
    });
  });
}

// updateMany: an unknown or already-marked id is a silent no-op, not an error.
export async function markWhatsAppOpened(orderRequestId: string) {
  await prisma.orderRequest.updateMany({
    where: { id: orderRequestId, whatsappOpenedAt: null },
    data: { whatsappOpenedAt: new Date() },
  });
}
