"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import { updateOrderRequestStatus, verifyAdvancePayment } from "@/lib/db/order-requests";
import type { OrderRequestStatus } from "@/generated/prisma/enums";

export async function setOrderStatus(id: string, status: OrderRequestStatus): Promise<void> {
  await assertAdmin();
  await updateOrderRequestStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function setAdvancePaymentVerified(id: string, verified: boolean): Promise<void> {
  await assertAdmin();
  await verifyAdvancePayment(id, verified);
  revalidatePath(`/admin/orders/${id}`);
}
