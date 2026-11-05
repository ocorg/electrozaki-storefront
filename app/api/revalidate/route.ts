import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { pingIndexNow } from "@/lib/indexnow";
import { prisma } from "@/lib/db/client";
import { LOCALES, localePath } from "@/lib/i18n/config";
import { BRAND_PAGES, offerSlug } from "@/lib/offers/phone-offers";

// Called by the ERP right after it changes catalog data (stock sync,
// photos, prices, packs…) so the public pages refresh at once instead of
// waiting for their cache to expire. It can only trigger a refresh — it reads
// product addresses and writes nothing — and requires the shared
// REVALIDATE_SECRET, so strangers can't use it to hammer the database.
//
// Body { productIds: [...] }: only those products' pages and the lists that
// show them (owner, 2026-11-05: refreshing the whole site on every sale used
// up the hosting's monthly processor time — every page was rebuilt again on
// the next visit by a customer or a robot). Body { all: true }, or no body
// (older ERP): the whole site, as before — the ERP's daily check and staff
// edits that change many pages (aisles, filters, promo pages) use it.
function authorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || !given) return false;
  const a = createHash("sha256").update(secret).digest();
  const b = createHash("sha256").update(given).digest();
  return timingSafeEqual(a, b);
}

const MAX_TARGETED = 60; // more products than this: refreshing everything is simpler

/** The pages (without language) that show these products. */
async function pathsFor(productIds: string[]): Promise<Set<string>> {
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { slug: true, isPhone: true, modelKey: true, category: { select: { slug: true, parent: { select: { slug: true } } } } },
  });
  // the home page and the promo list show stock and prices of what's on offer
  const paths = new Set<string>(["/", "/offres"]);
  for (const p of products) {
    paths.add(`/products/${p.slug}`);
    paths.add(`/collections/${p.category.slug}`);
    if (p.category.parent) paths.add(`/collections/${p.category.parent.slug}`);
    if (p.isPhone && p.modelKey) {
      const model = offerSlug(p.modelKey);
      paths.add(`/telephones/${model}`);
      paths.add(`/offres/${model}`);
      // the brand's promo page (/offres/iphone, /offres/samsung…)
      const brand = BRAND_PAGES[(p.modelKey.split("|")[0] ?? "").toLowerCase()];
      if (brand) paths.add(`/offres/${brand.slug}`);
    }
  }
  return paths;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { productIds?: unknown; all?: unknown } | null;
  const ids = Array.isArray(body?.productIds) ? body.productIds.filter((x): x is string => typeof x === "string").slice(0, 500) : null;

  if (!ids || body?.all === true || ids.length > MAX_TARGETED) {
    revalidatePath("/", "layout");
    after(pingIndexNow);
    return Response.json({ ok: true, scope: "all" });
  }
  if (ids.length === 0) return Response.json({ ok: true, scope: "none" });
  const paths = await pathsFor(ids);
  for (const path of paths) for (const locale of LOCALES) revalidatePath(localePath(locale, path));
  // the robots' list of pages (new or gone products)
  revalidatePath("/sitemap.xml");
  after(pingIndexNow);
  return Response.json({ ok: true, scope: "products", pages: paths.size * LOCALES.length });
}
