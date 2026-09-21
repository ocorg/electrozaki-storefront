export function formatMAD(amount: number | string): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "";
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Returns null (not 0) when there's nothing to advertise — a compareAtPrice
// that isn't actually higher than the sale price isn't a discount.
export function discountPercent(
  price: number | string,
  compareAtPrice: number | string | null | undefined
): number | null {
  if (compareAtPrice == null) return null;
  const salePrice = typeof price === "string" ? parseFloat(price) : price;
  const wasPrice = typeof compareAtPrice === "string" ? parseFloat(compareAtPrice) : compareAtPrice;
  if (!Number.isFinite(salePrice) || !Number.isFinite(wasPrice) || wasPrice <= salePrice) {
    return null;
  }
  return Math.round((1 - salePrice / wasPrice) * 100);
}
