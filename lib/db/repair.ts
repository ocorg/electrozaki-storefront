import type { RepairKind } from "@/generated/prisma/enums";
import { prisma } from "./client";

type RepairRequestInput = {
  kind: RepairKind;
  customerName: string;
  customerPhone: string;
  deviceBrand: string;
  deviceModel: string;
  problemAreas: string[];
  preferredSlot?: string;
  notes?: string;
};

export async function createRepairRequest(input: RepairRequestInput) {
  return prisma.repairRequest.create({
    data: {
      kind: input.kind,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deviceBrand: input.deviceBrand,
      deviceModel: input.deviceModel,
      problemAreas: input.problemAreas,
      preferredSlot: input.preferredSlot,
      notes: input.notes,
    },
  });
}
