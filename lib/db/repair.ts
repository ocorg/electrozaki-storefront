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
