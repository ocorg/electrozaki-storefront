"use client";

import { useState } from "react";
import Image from "next/image";
import { Gift, Check } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";

// Plain, JSON-serializable shape — Prisma's Decimal instances (bundlePrice,
// recommendedSalePrice) can't cross the Server -> Client Component boundary
// as-is, so the page converts them with .toString() before handing this
// down (same pattern already used for AddToCartControls' basePrice).
export type BundleOfferData = {
  id: string;
  name: string;
  description: string | null;
  bundlePrice: string;
  items: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      isPhone: boolean;
      recommendedSalePrice: string;
      images: { url: string }[];
    };
  }[];
};

// A bundle's line-item price can't be a single synthetic "discount" cart
// line the way GiftPicker's free gifts work — every OrderRequestItem must
// point at a real Product (see the plan note on this). Instead each member
// product is added at its own price, scaled down proportionally so the
// lines sum to exactly `bundlePrice`; the last item absorbs the rounding
// remainder so the total is always exact, never off by a MAD or two.
function allocateBundlePrices(
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

export function BundleOffer({ bundles }: { bundles: BundleOfferData[] }) {
  const { addItem } = useCart();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  return (
    <div className="mt-4 space-y-4">
      {bundles.map((bundle) => {
        const normalTotal = bundle.items.reduce(
          (sum, i) => sum + Number(i.product.recommendedSalePrice) * i.quantity,
          0
        );
        const bundlePrice = Number(bundle.bundlePrice);
        const savings = normalTotal - bundlePrice;
        const unitPrices = allocateBundlePrices(
          bundle.items.map((i) => ({ normalPrice: Number(i.product.recommendedSalePrice), quantity: i.quantity })),
          bundlePrice
        );
        const isAdded = addedBundleId === bundle.id;

        function handleAdd() {
          bundle.items.forEach((item, index) => {
            addItem(
              {
                productId: item.product.id,
                productName: `${item.product.name} (pack ${bundle.name})`,
                price: unitPrices[index],
                image: item.product.images[0]?.url,
                isPhone: item.product.isPhone,
              },
              item.quantity
            );
          });
          setAddedBundleId(bundle.id);
        }

        return (
          <div key={bundle.id} className={cardClasses("p-4")}>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Gift size={16} className="text-gold" />
              {bundle.name}
            </p>
            {bundle.description && (
              <p className="mt-1 text-sm text-neutral-600">{bundle.description}</p>
            )}

            <ul className="mt-3 space-y-2">
              {bundle.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative h-10 w-10 flex-none overflow-hidden rounded-lg bg-neutral-50">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        fill
                        sizes="40px"
                        className="object-contain p-1"
                      />
                    )}
                  </div>
                  <span className="flex-1 text-sm">
                    {item.quantity > 1 ? `${item.quantity}x ` : ""}
                    {item.product.name}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="rounded-lg bg-ink px-2.5 py-1 text-base font-bold text-gold">
                {formatMAD(bundlePrice)}
              </span>
              <span className="text-sm text-neutral-500 line-through">{formatMAD(normalTotal)}</span>
              {savings > 0 && (
                <span className="text-sm font-medium text-green-700">
                  Économisez {formatMAD(savings)}
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="accent"
              onClick={handleAdd}
              disabled={isAdded}
              className="mt-3"
            >
              {isAdded ? (
                <>
                  <Check size={18} /> Pack ajouté
                </>
              ) : (
                "Ajouter le pack au panier"
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
