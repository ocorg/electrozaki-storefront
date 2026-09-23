import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";

// Called by the ERP right after it changes catalog data (stock sync,
// photos, prices, packs…) so the public pages refresh at once instead of
// waiting for their 60-second cache to expire. It can only trigger a
// refresh — it reads and writes nothing — and requires the shared
// REVALIDATE_SECRET, so strangers can't use it to hammer the database.
function authorized(request: Request): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (!secret || !given) return false;
  // Compare fixed-length digests so the check takes the same time whatever
  // the input.
  const a = createHash("sha256").update(secret).digest();
  const b = createHash("sha256").update(given).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return Response.json({ ok: true });
}
