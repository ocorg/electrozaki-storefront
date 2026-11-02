// "4 000 DH" — how prices are said and written in Morocco (and how the ERP's
// unit names already read: "… · 4000 DH"). The fr-MA currency format gave
// "4.000 MAD", which French-speaking customers read as four (dot) zero.
// Thousands use a no-break space so a price never wraps across lines.
const GROUPED = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

// In Arabic, a leading left-to-right mark (invisible) keeps "4 000 DH" in
// that order inside right-to-left text, where it would otherwise display as
// "DH 4 000". Only there: elsewhere it was a stray character in copied text.
// `locale`: the page's language ("ar") or its Intl tag ("ar-MA").
export function formatMAD(amount: number | string, locale?: string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "";
  const mark = locale?.startsWith("ar") ? "‎" : "";
  return `${mark}${GROUPED.format(value).replace(/[\s ]/g, " ")} DH`;
}

/** formatMAD for page titles and descriptions: never the invisible
 * direction mark (it's for the page layout; Google could show it). */
export function formatMADText(amount: number | string): string {
  return formatMAD(amount);
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

/**
 * The small brand label shown above a product name, or null when the name
 * already starts with it ("Samsung" above "Samsung Galaxy A07" read as
 * "Samsung Samsung Galaxy A07" to screen readers and search engines).
 */
export function brandLabel(brand: string | null | undefined, name: string): string | null {
  if (!brand) return null;
  return name.trim().toLowerCase().startsWith(brand.trim().toLowerCase()) ? null : brand;
}
