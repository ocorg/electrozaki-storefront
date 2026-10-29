import { createHash, timingSafeEqual } from "node:crypto";
import { getAllPublicProducts } from "@/lib/db/public-products";
import { feedRows, toCsv } from "@/lib/catalog-feed";
import { absoluteUrl } from "@/lib/site";

// The catalogue feed for Meta Commerce Manager (WhatsApp catalogue,
// Instagram / Facebook shopping, the ads' product sets).
//
// It lists every phone with its price, condition and battery: a ready-made
// export for a competitor. So it only answers with the secret key in its
// address (owner's decision, 2026-10-29); anything else gets a 404, as if
// it didn't exist. The address to give Meta:
//   https://electrozaki.ma/feeds/meta-catalog.csv?key=<META_FEED_KEY>
// META_FEED_KEY is a Vercel environment variable (never in the code); while
// it isn't set, the feed is closed to everyone. Changing it means pasting
// the new address in Commerce Manager.
const FEED_KEY = process.env.META_FEED_KEY?.trim() ?? "";

function keyOk(given: string | null): boolean {
  if (!FEED_KEY || !given) return false;
  const a = createHash("sha256").update(FEED_KEY).digest();
  const b = createHash("sha256").update(given).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!keyOk(new URL(request.url).searchParams.get("key"))) return new Response("Not found", { status: 404 });
  const products = await getAllPublicProducts();
  const csv = toCsv(feedRows(products, (slug) => absoluteUrl(`/feeds/product-image/${slug}`)));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="electro-zaki-catalogue.csv"',
      // Never kept by a shared cache: a cached copy would answer without the key.
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
