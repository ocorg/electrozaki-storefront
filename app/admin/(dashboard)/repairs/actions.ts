"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin } from "@/lib/admin-auth";
import { updateRepairRequestStatus } from "@/lib/db/repair";
import type { RepairRequestStatus } from "@/generated/prisma/enums";

export async function setRepairStatus(id: string, status: RepairRequestStatus): Promise<void> {
  await assertAdmin();
  await updateRepairRequestStatus(id, status);
  revalidatePath("/admin/repairs");
}
