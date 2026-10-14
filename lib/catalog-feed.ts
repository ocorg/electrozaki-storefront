import type { PublicProduct } from "@/lib/db/public-products";
import { absoluteUrl } from "@/lib/site";

// The shop's catalogue as Meta Commerce Manager reads it (a "data feed":
// one CSV row per item, with Meta's own column names). Meta collects it on a
// schedule and uses it for the WhatsApp catalogue, its WhatsApp business
// agent, and Instagram / Facebook shopping. Pure: no database here.
//
// A used phone is sold unit by unit at different prices, so each unit in
// stock is its own row, grouped under its listing (item_group_id). Every
// other product is one row.

export const FEED_COLUMNS = [
  "id",
  "item_group_id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "sale_price",
  "link",
  "image_link",
  "brand",
  "product_type",
] as const;

type Row = Record<(typeof FEED_COLUMNS)[number], string>;

const GRADE: Record<string, string> = {
  NEUF: "Neuf",
  TRES_BON: "Très bon état",
  BON: "Bon état",
  PIECES_REMPLACEES: "Pièces remplacées",
};

const money = (n: number) => `${n.toFixed(2)} MAD`;
const num = (v: { toString(): string } | null | undefined) => (v == null ? null : Number(v.toString()));

/** "price" is what the customer pays, unless a "was" price exists: then Meta wants it as price and the real one as sale_price. */
function prices(pay: number, was: number | null): Pick<Row, "price" | "sale_price"> {
  return was !== null && was > pay ? { price: money(was), sale_price: money(pay) } : { price: money(pay), sale_price: "" };
}

function plain(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function feedRows(products: PublicProduct[], imageFallback: (slug: string) => string): Row[] {
  const rows: Row[] = [];
  for (const p of products) {
    const link = absoluteUrl(`/fr/products/${p.slug}`);
    const brand = p.brand?.trim() || "Electro Zaki";
    const type = p.category.name;
    const grade = GRADE[p.condition] ?? "";
    const condition = p.condition === "NEUF" ? "new" : "used";
    const cover = p.images[0]?.url ?? imageFallback(p.slug);
    const shop = "Vendu par Electro Zaki à Meknès, livraison partout au Maroc, paiement à la livraison.";

    const units = p.isPhone ? p.variants.filter((v) => v.stockQuantity > 0) : [];
    if (units.length) {
      for (const v of units) {
        const battery = v.batteryHealthPercent ?? p.batteryHealthPercent;
        const details = [grade, v.color, battery != null && p.condition !== "NEUF" ? `batterie ${battery} %` : null].filter(Boolean).join(", ");
        rows.push({
          id: v.id,
          item_group_id: p.id,
          title: plain(`${p.name}${v.color ? ` ${v.color}` : ""}`).slice(0, 150),
          description: plain(`${p.name} : ${details}. ${v.hasDefects && v.transparencyNotes ? `${v.transparencyNotes}. ` : ""}${shop}`).slice(0, 5000),
          availability: "in stock",
          condition,
          ...prices(num(v.priceOverride) ?? num(p.recommendedSalePrice)!, num(v.compareAtPrice)),
          link,
          image_link: v.imageUrl ?? cover,
          brand,
          product_type: type,
        });
      }
      continue;
    }

    rows.push({
      id: p.id,
      item_group_id: "",
      title: plain(p.name).slice(0, 150),
      description: plain(`${p.name} (${type}${p.isPhone && grade ? `, ${grade}` : ""}). ${p.description ? `${p.description} ` : ""}${shop}`).slice(0, 5000),
      availability: p.availability === "IN_STOCK" ? "in stock" : p.availability === "COMING_SOON" ? "preorder" : "out of stock",
      condition,
      ...prices(num(p.recommendedSalePrice)!, num(p.compareAtPrice)),
      link,
      image_link: cover,
      brand,
      product_type: type,
    });
  }
  return rows;
}

/** RFC 4180 CSV: every field quoted, quotes doubled, CRLF line ends. */
export function toCsv(rows: Row[]): string {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [FEED_COLUMNS.join(","), ...rows.map((r) => FEED_COLUMNS.map((c) => cell(r[c])).join(","))].join("\r\n") + "\r\n";
}
