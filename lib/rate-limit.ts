import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "./db/client";
import { recordBot } from "./bot-hits";

// Caps how often one visitor can hit a public form, so a script can't flood
// the order queue, fill the receipts bucket or guess promo codes. Counted
// in the database (no extra service): one row per attempt, keyed by a
// salted hash of the IP — the raw address is never stored.
const LIMITS = {
  // Generous per connection: Moroccan mobile carriers put many customers
  // behind one address. Per-phone limits (below) catch repeat orders.
  order: { max: 20, windowMinutes: 60 },
  // Orders carrying a promo code: a capped code can't be used up with
  // throwaway orders from one connection.
  promo_order: { max: 3, windowMinutes: 24 * 60 },
  upload: { max: 10, windowMinutes: 60 },
  contact: { max: 5, windowMinutes: 60 },
  repair: { max: 5, windowMinutes: 60 },
  promo: { max: 20, windowMinutes: 60 },
  track: { max: 20, windowMinutes: 60 }, // repair / order tracking lookups, quote answers
  view: { max: 10, windowMinutes: 60 }, // promo page visit counts
  whatsapp: { max: 20, windowMinutes: 60 }, // "WhatsApp opened" marks on orders
  review: { max: 10, windowMinutes: 60 }, // reviews written or edited on the tracking page
} as const;

export type RateLimitBucket = keyof typeof LIMITS;

/** The hashing salt. Fails closed: without it, every key would be guessable. */
function salt(): string {
  const s = process.env.RECEIPT_SIGNING_SECRET;
  if (!s) throw new Error("RECEIPT_SIGNING_SECRET is not set");
  return s;
}

/** The caller's address as the hosting edge saw it (Vercel sets x-real-ip; the client can't). */
async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-real-ip")?.trim() || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

async function visitorHash(): Promise<string> {
  return createHash("sha256").update(`${salt()}:${await clientIp()}`).digest("hex").slice(0, 32);
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

  // Occasional housekeeping instead of a cron job (the longest window is a day).
  if (Math.random() < 0.05) {
    await prisma.rateLimitHit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 25 * 60 * 60_000) } },
    });
  }
  return true;
}

// ── Limits about a phone number ─────────────────────────────────────────
// A phone number is typed by the caller, so a limit keyed on it alone would
// let anyone who knows a customer's number use up that customer's allowance
// (lock them out of ordering or tracking). Each is therefore counted per
// phone AND connection (what one caller can do), with a much higher
// phone-only ceiling as a backstop against attempts spread over many
// connections.

const lastNine = (phone: string) => phone.replace(/\D/g, "").slice(-9);

function phoneKey(phone: string): string {
  return createHash("sha256").update(`${salt()}:phone:${lastNine(phone)}`).digest("hex").slice(0, 32);
}

async function phoneCallerKey(phone: string): Promise<string> {
  return createHash("sha256").update(`${salt()}:phone:${lastNine(phone)}:ip:${await clientIp()}`).digest("hex").slice(0, 32);
}

async function countSince(bucket: string, keyHash: string, hours: number): Promise<number> {
  return prisma.rateLimitHit.count({
    where: { bucket, keyHash, createdAt: { gte: new Date(Date.now() - hours * 60 * 60_000) } },
  });
}

// Tracking (repairs, orders): someone who knows a customer's phone could try
// reference numbers one after the other. 5 wrong references for one phone
// from one connection in 24 h lock that phone for that connection; 30 from
// anywhere lock it for everyone (guessing from many connections).
const TRACK_FAILURES = { perCaller: 5, perPhone: 30, windowHours: 24 };

export async function trackingPhoneLocked(phone: string): Promise<boolean> {
  const [mine, all] = await Promise.all([
    countSince("track_phone_caller", await phoneCallerKey(phone), TRACK_FAILURES.windowHours),
    countSince("track_phone", phoneKey(phone), TRACK_FAILURES.windowHours),
  ]);
  if (mine < TRACK_FAILURES.perCaller && all < TRACK_FAILURES.perPhone) return false;
  await recordBot("blocked", "track_phone");
  return true;
}

export async function recordTrackingFailure(phone: string): Promise<void> {
  await prisma.rateLimitHit.createMany({
    data: [
      { bucket: "track_phone_caller", keyHash: await phoneCallerKey(phone) },
      { bucket: "track_phone", keyHash: phoneKey(phone) },
    ],
  });
}

// Orders per phone number: a real customer orders once or twice a day; more
// from one number is a mistake or a prank. 3 per number from one
// connection, 10 per number from anywhere. Recorded only for orders that
// were actually placed.
const PHONE_ORDERS = { perCaller: 3, perPhone: 10, windowHours: 24 };

export async function phoneOrderLimitReached(phone: string): Promise<boolean> {
  const [mine, all] = await Promise.all([
    countSince("order_phone_caller", await phoneCallerKey(phone), PHONE_ORDERS.windowHours),
    countSince("order_phone", phoneKey(phone), PHONE_ORDERS.windowHours),
  ]);
  if (mine < PHONE_ORDERS.perCaller && all < PHONE_ORDERS.perPhone) return false;
  await recordBot("blocked", "order_phone");
  return true;
}

export async function recordPhoneOrder(phone: string): Promise<void> {
  await prisma.rateLimitHit.createMany({
    data: [
      { bucket: "order_phone_caller", keyHash: await phoneCallerKey(phone) },
      { bucket: "order_phone", keyHash: phoneKey(phone) },
    ],
  });
}

export const PHONE_ORDER_LIMIT_MESSAGE =
  "Vous avez déjà passé plusieurs commandes avec ce numéro aujourd'hui. Nous vous appelons très vite, ou écrivez-nous sur WhatsApp.";

export const RATE_LIMIT_MESSAGE =
  "Trop de tentatives. Merci de réessayer dans une heure ou de nous écrire sur WhatsApp.";
