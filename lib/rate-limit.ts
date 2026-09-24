import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "./db/client";

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
  if (recent >= max) return false;

  await prisma.rateLimitHit.create({ data: { bucket, keyHash } });

  // Occasional housekeeping instead of a cron job.
  if (Math.random() < 0.05) {
    await prisma.rateLimitHit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60_000) } },
    });
  }
  return true;
}

export const RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Merci de réessayer dans une heure ou de nous écrire sur WhatsApp.";
