import { OrderRequestStatus } from "@/generated/prisma";
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
  notes?: string;
  items: OrderRequestItemInput[];
};

// Called from the cart submit action (deliverable 4). Creates the durable
// record that both feeds the internal queue and supplies the numbers used
// to build the WhatsApp prefill message.
export async function createOrderRequest(input: OrderRequestInput) {
  const totalEstimate = input.items.reduce(
    (sum, i) => sum + i.priceAtRequest * i.quantity,
    0
  );

  return prisma.orderRequest.create({
    data: {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      notes: input.notes,
      totalEstimate,
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
// which middleware.ts gates behind the admin session cookie.
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
