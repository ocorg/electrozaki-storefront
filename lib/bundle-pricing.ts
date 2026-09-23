// A bundle's line-item price can't be a single synthetic "discount" cart
// line the way GiftPicker's free gifts work — every OrderRequestItem must
// point at a real Product. Instead each member product is added at its own
// price, scaled down proportionally so the lines sum to exactly
// `bundlePrice`; the last item absorbs the rounding remainder so the total
// is always exact, never off by a MAD or two.
//
// Shared by the pack card (display) and the order action (the price the
// server actually charges), so the two can never disagree.
export function allocateBundlePrices(
  items: { normalPrice: number; quantity: number }[],
  bundlePrice: number
): number[] {
  const normalTotal = items.reduce((sum, i) => sum + i.normalPrice * i.quantity, 0);
  let allocated = 0;

  return items.map((item, index) => {
    const isLast = index === items.length - 1;
    const lineNormal = item.normalPrice * item.quantity;
    const lineShare =
      normalTotal > 0 ? bundlePrice * (lineNormal / normalTotal) : bundlePrice / items.length;
    const lineTotal = isLast ? bundlePrice - allocated : Math.round(lineShare);
    allocated += lineTotal;
    return lineTotal / item.quantity;
  });
}
