import { prisma } from "@/lib/db/client";
import { LOCALES, localePath } from "@/lib/i18n/config";
import { offerSlug } from "@/lib/offers/phone-offers";
import { OPEN_PRODUCTS, absoluteUrl } from "@/lib/site";

// IndexNow: tells Bing (and Yandex, Naver, Seznam…) which pages changed, so
// a new phone shows up in their results within hours instead of whenever
// their robot comes back. Called after the ERP refreshes the site
// (/api/revalidate). The key is public by design: the file
// public/<key>.txt proves the site is ours.
export const INDEXNOW_KEY = "5505e4a29ff66d36f648a5395daaea51";

// The ERP refreshes the site on every stock change: one batch at most every
// 10 minutes (per server instance; a repeat is harmless), with every listing
// changed since the last one (2 hours back for a fresh instance).
const EVERY_MS = 10 * 60_000;
let lastSent = 0;

export async function pingIndexNow(): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;
  const now = Date.now();
  if (now - lastSent < EVERY_MS) return;
  const since = new Date(lastSent || now - 2 * 3_600_000);
  lastSent = now;
  try {
    const changed = await prisma.product.findMany({
      where: { ...OPEN_PRODUCTS, updatedAt: { gte: since } },
      select: { slug: true, modelKey: true, isPhone: true },
      take: 500,
    });
    if (!changed.length) return;
    // A sold or new phone also changes its model page and the phones aisle.
    const paths = new Set<string>(["/collections/telephones"]);
    for (const p of changed) {
      paths.add(`/products/${p.slug}`);
      if (p.isPhone && p.modelKey) paths.add(`/telephones/${offerSlug(p.modelKey)}`);
    }
    const urlList = LOCALES.flatMap((locale) => [...paths].map((path) => absoluteUrl(localePath(locale, path))));
    const host = new URL(absoluteUrl("/")).host;
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key: INDEXNOW_KEY, keyLocation: absoluteUrl(`/${INDEXNOW_KEY}.txt`), urlList: urlList.slice(0, 10_000) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok && res.status !== 202) console.error("[indexnow] status", res.status);
  } catch (err) {
    console.error("[indexnow] failed silently:", err);
  }
}
