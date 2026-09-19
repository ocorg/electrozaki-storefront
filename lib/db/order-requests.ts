import { OrderRequestStatus, AdvancePaymentStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

type OrderRequestItemInput = {
  productId: string;
  variantId?: string;
  productNameSnapshot: string;
  priceAtRequest: number;
  quantity: number;
};

type OrderRequestInput = {
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  notes?: string;
  requiresAdvance: boolean;
  receiptUrl?: string;
  dataConsentAccepted: boolean;
  items: OrderRequestItemInput[];
};

// Called from the cart submit action. Creates the durable record that both
// feeds the internal queue and supplies the numbers used to build the
// WhatsApp prefill message.
export async function createOrderRequest(input: OrderRequestInput) {
  const totalEstimate = input.items.reduce(
    (sum, i) => sum + i.priceAtRequest * i.quantity,
    0
  );

  // Phase-2 payment status: only meaningful when the order actually
  // requires the advance — an accessory-only order stays NOT_REQUIRED
  // regardless of whether a receiptUrl happens to be present.
  const advancePaymentStatus: AdvancePaymentStatus = !input.requiresAdvance
    ? AdvancePaymentStatus.NOT_REQUIRED
    : input.receiptUrl
      ? AdvancePaymentStatus.RECEIPT_UPLOADED
      : AdvancePaymentStatus.AWAITING_RECEIPT;

  return prisma.orderRequest.create({
    data: {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryAddress: input.deliveryAddress,
      notes: input.notes,
      totalEstimate,
      requiresAdvance: input.requiresAdvance,
      advancePaymentStatus,
      receiptUrl: input.receiptUrl,
      receiptUploadedAt: input.receiptUrl ? new Date() : undefined,
      dataConsentAccepted: input.dataConsentAccepted,
      items: {
        create: input.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          productNameSnapshot: i.productNameSnapshot,
          priceAtRequest: i.priceAtRequest,
          quantity: i.quantity,
        })),
      },
    },
    include: { items: true },
  });
}

export async function markWhatsAppOpened(orderRequestId: string) {
  return prisma.orderRequest.update({
    where: { id: orderRequestId },
    data: { whatsappOpenedAt: new Date() },
  });
}

// Admin-only reads/writes — only ever called from app/admin routes,
// which proxy.ts gates behind the admin session cookie.
export async function listOrderRequests(status?: OrderRequestStatus) {
  return prisma.orderRequest.findMany({
    where: status ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateOrderRequestStatus(
  id: string,
  status: OrderRequestStatus
) {
  return prisma.orderRequest.update({ where: { id }, data: { status } });
}

export async function verifyAdvancePayment(id: string, verified: boolean) {
  return prisma.orderRequest.update({
    where: { id },
    data: {
      advancePaymentStatus: verified
        ? AdvancePaymentStatus.VERIFIED
        : AdvancePaymentStatus.REJECTED,
    },
  });
}
