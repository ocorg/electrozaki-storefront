import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "./db/client";
import { recordBot } from "./bot-hits";

// Caps how often one visitor can hit a public form, so a script can't flood
// the order queue, fill the receipts bucket or guess promo codes. Counted
// in the database (no extra service): one row per attempt, keyed by a
// salted hash of the IP — the raw address is never stored.
const LIMITS = {
  order: { max: 5, windowMinutes: 60 },
  upload: { max: 10, windowMinutes: 60 },
  contact: { max: 5, windowMinutes: 60 },
  repair: { max: 5, windowMinutes: 60 },
  promo: { max: 20, windowMinutes: 60 },
  track: { max: 20, windowMinutes: 60 }, // repair tracking lookups / quote answers
  view: { max: 10, windowMinutes: 60 }, // promo page visit counts
} as const;

export type RateLimitBucket = keyof typeof LIMITS;

async function visitorHash(): Promise<string> {
  const h = await headers();
  // Vercel sets x-forwarded-for itself (the client can't spoof the first
  // entry there); x-real-ip is the fallback for local dev.
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const salt = process.env.RECEIPT_SIGNING_SECRET ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

// Records the attempt and returns false when the visitor is over the limit.
export async function allowRequest(bucket: RateLimitBucket): Promise<boolean> {
  const { max, windowMinutes } = LIMITS[bucket];
  const keyHash = await visitorHash();
  const since = new Date(Date.now() - windowMinutes * 60_000);

  const recent = await prisma.rateLimitHit.count({
    where: { bucket, keyHash, createdAt: { gte: since } },
  });
  if (recent >= max) {
    await recordBot("blocked", bucket); // shown in the ERP's "Bouclier"
    return false;
  }

  await prisma.rateLimitHit.create({ data: { bucket, keyHash } });

  // Occasional housekeeping instead of a cron job.
  if (Math.random() < 0.05) {
    await prisma.rateLimitHit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } },
    });
  }
  return true;
}

// Repair tracking: someone who knows a customer's phone could try ticket
// numbers one after the other (REP numbers follow each other). After 5
// wrong numbers for one phone in 24 h, that phone can't be looked up for
// the rest of the day — whatever connection the attempts come from.
const PHONE_FAILURES = { max: 5, windowHours: 24 };

function phoneKey(phone: string): string {
  const salt = process.env.RECEIPT_SIGNING_SECRET ?? "";
  return createHash("sha256").update(`${salt}:phone:${phone.replace(/\D/g, "").slice(-9)}`).digest("hex").slice(0, 32);
}

export async function trackingPhoneLocked(phone: string): Promise<boolean> {
  const since = new Date(Date.now() - PHONE_FAILURES.windowHours * 60 * 60_000);
  const failures = await prisma.rateLimitHit.count({
    where: { bucket: "track_phone", keyHash: phoneKey(phone), createdAt: { gte: since } },
  });
  if (failures < PHONE_FAILURES.max) return false;
  await recordBot("blocked", "track_phone");
  return true;
}

export async function recordTrackingFailure(phone: string): Promise<void> {
  await prisma.rateLimitHit.create({ data: { bucket: "track_phone", keyHash: phoneKey(phone) } });
}

export const RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Merci de réessayer dans une heure ou de nous écrire sur WhatsApp.";
