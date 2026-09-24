import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "./db/client";

// Repair tracking rows are written by the ERP (src/lib/storefront/tracking.ts)
// with the customer's phone stored only as an HMAC keyed by the secret both
// apps share (REVALIDATE_SECRET here). A lookup needs the number AND the
// phone — the number alone reveals nothing. The number is either the ERP
// ticket (REP-0142, on the drop-off slip) or the website request number
// (DEM-7K4Q9P, random, given when the request is sent); a request already
// turned into a ticket shows that ticket. Guessing is capped per phone in
// app/(storefront)/reparation/suivi/actions.ts.

function phoneHash(phone: string): string {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) throw new Error("REVALIDATE_SECRET is not set");
  return createHmac("sha256", secret).update(`track:${phone.replace(/\D/g, "").slice(-9)}`).digest("base64url");
}

export type TrackedRepair = {
  ref: string;
  /** website request number, when the customer looked it up with it */
  requestRef: string | null;
  kind: "HARDWARE" | "SOFTWARE" | "CONSULTATION";
  status: string;
  device: string;
  quoteAmount: number | null;
  quoteDecision: "ACCEPTED" | "REFUSED" | null;
  cancelled: boolean;
  updatedAt: string;
};

const REP_RE = /^REP-\d{1,8}$/;
const DEM_RE = /^DEM-[A-Z0-9]{6}$/;

export const cleanTrackingRef = (ref: string) => ref.trim().toUpperCase().replace(/\s+/g, "");
export const isTrackingRef = (ref: string) => REP_RE.test(ref) || DEM_RE.test(ref);

/** Same phone? (last 9 digits, compared in constant time through the HMAC) */
function samePhone(stored: string, given: string): boolean {
  const a = Buffer.from(phoneHash(stored));
  const b = Buffer.from(phoneHash(given));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The repair (or website request), only when the phone matches. */
export async function findTrackedRepair(ref: string, phone: string): Promise<TrackedRepair | null> {
  const cleanRef = cleanTrackingRef(ref);
  if (phone.replace(/\D/g, "").length < 9) return null;
  if (DEM_RE.test(cleanRef)) return findRequest(cleanRef, phone);
  if (!REP_RE.test(cleanRef)) return null;
  return findTicket(cleanRef, phone, null);
}

async function findRequest(ref: string, phone: string): Promise<TrackedRepair | null> {
  const req = await prisma.repairRequest.findUnique({ where: { ref } });
  if (!req || !samePhone(req.customerPhone, phone)) return null;
  // Turned into an ERP ticket: follow the ticket.
  if (req.repairRef) {
    const ticket = await findTicket(req.repairRef, phone, req.ref);
    if (ticket) return ticket;
  }
  const device = [req.deviceBrand, req.deviceModel].filter(Boolean).join(" ") || "Consultation en ligne";
  return {
    ref: req.repairRef ?? req.ref,
    requestRef: req.ref,
    kind: req.kind,
    // Not yet a ticket: "demande reçue"; a ticket not yet synced: "reçu".
    status: req.repairRef ? "en_attente" : "demande_recue",
    device,
    quoteAmount: null,
    quoteDecision: null,
    cancelled: req.status === "CANCELLED",
    updatedAt: req.updatedAt.toISOString(),
  };
}

async function findTicket(ref: string, phone: string, requestRef: string | null): Promise<TrackedRepair | null> {
  const row = await prisma.repairTracking.findUnique({ where: { ref } });
  if (!row) return null;
  const a = Buffer.from(row.phoneHash);
  const b = Buffer.from(phoneHash(phone));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return {
    ref: row.ref,
    requestRef,
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
