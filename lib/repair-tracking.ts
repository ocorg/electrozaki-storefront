import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "./db/client";

// Repair tracking rows are written by the ERP (src/lib/storefront/tracking.ts)
// with the customer's phone stored only as an HMAC keyed by the secret both
// apps share (REVALIDATE_SECRET here). A lookup needs the ticket number AND
// the phone — the ticket number alone reveals nothing.

function phoneHash(phone: string): string {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) throw new Error("REVALIDATE_SECRET is not set");
  return createHmac("sha256", secret).update(`track:${phone.replace(/\D/g, "").slice(-9)}`).digest("base64url");
}

export type TrackedRepair = {
  ref: string;
  kind: "HARDWARE" | "SOFTWARE" | "CONSULTATION";
  status: string;
  device: string;
  quoteAmount: number | null;
  quoteDecision: "ACCEPTED" | "REFUSED" | null;
  cancelled: boolean;
  updatedAt: string;
};

/** The ticket, only when the phone matches (constant-time compare). */
export async function findTrackedRepair(ref: string, phone: string): Promise<TrackedRepair | null> {
  const cleanRef = ref.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^REP-\d{1,8}$/.test(cleanRef) || phone.replace(/\D/g, "").length < 9) return null;
  const row = await prisma.repairTracking.findUnique({ where: { ref: cleanRef } });
  if (!row) return null;
  const a = Buffer.from(row.phoneHash);
  const b = Buffer.from(phoneHash(phone));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return {
    ref: row.ref,
    kind: row.kind,
    status: row.status,
    device: row.device,
    quoteAmount: row.quoteAmount === null ? null : Number(row.quoteAmount),
    quoteDecision: row.quoteDecision === "ACCEPTED" || row.quoteDecision === "REFUSED" ? row.quoteDecision : null,
    cancelled: row.cancelled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Records the customer's answer to a pending quote (the ERP applies it). */
export async function answerTrackedQuote(ref: string, phone: string, accept: boolean): Promise<TrackedRepair | null> {
  const repair = await findTrackedRepair(ref, phone);
  if (!repair || repair.cancelled || repair.status !== "devis_envoye" || repair.quoteDecision) return null;
  await prisma.repairTracking.updateMany({
    where: { ref: repair.ref, quoteDecision: null },
    data: { quoteDecision: accept ? "ACCEPTED" : "REFUSED", quoteDecidedAt: new Date(), decisionApplied: false },
  });
  return { ...repair, quoteDecision: accept ? "ACCEPTED" : "REFUSED" };
}
