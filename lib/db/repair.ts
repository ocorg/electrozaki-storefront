import type { RepairRequestStatus } from "@/generated/prisma/enums";
import { prisma } from "./client";

type RepairRequestInput = {
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  problemAreas: string[];
  notes?: string;
};

export async function createRepairRequest(input: RepairRequestInput) {
  return prisma.repairRequest.create({
    data: {
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deviceBrand: input.deviceBrand,
      deviceModel: input.deviceModel,
      problemAreas: input.problemAreas,
      notes: input.notes,
    },
  });
}

// Admin-only — only ever called from app/admin routes, which proxy.ts gates
// behind the admin session cookie.
export async function listRepairRequests() {
  return prisma.repairRequest.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateRepairRequestStatus(id: string, status: RepairRequestStatus) {
  return prisma.repairRequest.update({ where: { id }, data: { status } });
}

export async function countOpenRepairRequests(): Promise<number> {
  return prisma.repairRequest.count({ where: { status: { in: ["NEW", "CONTACTED"] } } });
}
