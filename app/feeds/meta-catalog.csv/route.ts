import { getAllPublicProducts } from "@/lib/db/public-products";
import { feedRows, toCsv } from "@/lib/catalog-feed";
import { absoluteUrl } from "@/lib/site";

// The catalogue feed for Meta Commerce Manager (WhatsApp catalogue and
// business agent, Instagram / Facebook shopping). Add this address as a
// scheduled data feed there. Rebuilt at most every 30 minutes.
export const revalidate = 1800;

export async function GET() {
  const products = await getAllPublicProducts();
  const csv = toCsv(feedRows(products, (slug) => absoluteUrl(`/feeds/product-image/${slug}`)));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'inline; filename="electro-zaki-catalogue.csv"',
    },
  });
}
