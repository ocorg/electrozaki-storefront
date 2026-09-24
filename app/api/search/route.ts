import { suggestProducts } from "@/lib/db/public-products";

// Live suggestions for the header search box (public catalogue data only —
// the same products and prices every visitor already sees on the pages).
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  if (q.length < 2) return Response.json({ items: [], total: 0 });
  try {
    const result = await suggestProducts(q, 6);
    return Response.json(result, { headers: { "cache-control": "public, max-age=30, s-maxage=60" } });
  } catch {
    return Response.json({ items: [], total: 0 }, { status: 500 });
  }
}
