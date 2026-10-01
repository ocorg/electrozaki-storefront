// "4 000 DH" — how prices are said and written in Morocco (and how the ERP's
// unit names already read: "… · 4000 DH"). The fr-MA currency format gave
// "4.000 MAD", which French-speaking customers read as four (dot) zero.
// Thousands use a no-break space so a price never wraps across lines.
const GROUPED = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

// The leading left-to-right mark (invisible) keeps "4 000 DH" in that order
// inside Arabic text, where it would otherwise display as "DH 4 000".
export function formatMAD(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "";
  return `‎${GROUPED.format(value).replace(/[\s ]/g, " ")} DH`;
}

// DH saved, or null (not 0) when there's nothing to advertise — a
// compareAtPrice that isn't actually higher than the price isn't a discount.
export function savingOf(
  price: number | string | null | undefined,
  compareAtPrice: number | string | null | undefined
): number | null {
  if (price == null || compareAtPrice == null) return null;
  const salePrice = typeof price === "string" ? parseFloat(price) : price;
  const wasPrice = typeof compareAtPrice === "string" ? parseFloat(compareAtPrice) : compareAtPrice;
  if (!Number.isFinite(salePrice) || !Number.isFinite(wasPrice) || wasPrice <= salePrice) {
    return null;
  }
  return Math.round(wasPrice - salePrice);
}
