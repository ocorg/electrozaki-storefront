import { createHmac } from "node:crypto";
import { after } from "next/server";
import { prisma } from "@/lib/db/client";
import { classifyBot, deviceOf } from "@/lib/bots";
import { recordBot } from "@/lib/bot-hits";

// Receives the page's anonymous statistics signal (components/analytics).
// Never stores the IP or anything that identifies a person: the visitor is
// an HMAC of (day, IP, browser) that changes every day.

const TYPES = new Set(["view", "add_to_cart", "search"]);
const SOURCES = new Set([
  "direct", "instagram", "facebook", "tiktok", "google", "whatsapp", "youtube", "snapchat", "recherche", "qr", "autre",
]);

// Best-effort flood guard, per server instance: one visitor can't send more
// than 120 signals in 10 minutes. Statistics, not security — the real
// forms keep their database rate limits.
const recent = new Map<string, { n: number; until: number }>();
function tooMany(key: string): boolean {
  const now = Date.now();
  if (recent.size > 5000) recent.clear();
  const r = recent.get(key);
  if (!r || r.until < now) {
    recent.set(key, { n: 1, until: now + 10 * 60_000 });
    return false;
  }
  r.n += 1;
  return r.n > 120;
}

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const int = (v: unknown, max: number) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max ? Math.round(v) : null;

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent");
  // Robots that run JavaScript (Google renders pages) go to the robot counter.
  const bot = classifyBot(ua);
  if (bot) {
    after(() => recordBot(bot.category, bot.name));
    return new Response(null, { status: 204 });
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > 2000) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const type = str(body.t, 20);
  const path = str(body.p, 200);
  if (!type || !TYPES.has(type) || !path || !path.startsWith("/")) return new Response(null, { status: 400 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const secret = process.env.RECEIPT_SIGNING_SECRET ?? "";
  const visitorHash = createHmac("sha256", `visitor:${secret}`).update(`${day}|${ip}|${ua ?? ""}`).digest("base64url").slice(0, 24);
  if (tooMany(visitorHash)) return new Response(null, { status: 429 });

  const source = str(body.s, 20);
  const value = typeof body.v === "number" && Number.isFinite(body.v) && body.v >= 0 && body.v < 1_000_000 ? body.v : null;

  after(async () => {
    try {
      await prisma.analyticsEvent.create({
        data: {
          type,
          path: path.split("?")[0],
          productId: type === "add_to_cart" ? str(body.pid, 40) : null,
          value: type === "add_to_cart" ? value : null,
          query: type === "search" ? str(body.q, 60)?.toLowerCase() ?? null : null,
          results: type === "search" ? int(body.r, 10_000) : null,
          source: source && SOURCES.has(source) ? source : "autre",
          device: deviceOf(ua),
          visitorHash,
          loadMs: type === "view" ? int(body.l, 120_000) : null,
        },
      });
    } catch {
      // Statistics must never break the site.
    }
  });
  return new Response(null, { status: 204 });
}
