import { randomInt } from "node:crypto";
import type { RepairKind } from "@/generated/prisma/enums";
import { prisma } from "./client";

// No 0/O or 1/I: the customer may read the number out over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const newRef = () => `DEM-${Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("")}`;

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

/** Saves the request with a random customer number (retried on the rare clash). */
export async function createRepairRequest(input: RepairRequestInput) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await insert(input, newRef());
    } catch (err) {
      const clash = (err as { code?: string }).code === "P2002";
      if (!clash || attempt >= 4) throw err;
    }
  }
}

function insert(input: RepairRequestInput, ref: string) {
  return prisma.repairRequest.create({
    data: {
      ref,
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
