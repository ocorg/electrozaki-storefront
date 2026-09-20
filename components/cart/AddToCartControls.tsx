"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "./CartContext";
import { Button } from "@/components/ui/Button";

type VariantOption = {
  id: string;
  name: string;
  priceOverride: string | null;
  skuOrRef: string | null;
};

type Props = {
  productId: string;
  productName: string;
  image?: string;
  variants: VariantOption[];
  basePrice: string; // Decimal serialized as string from the server component
  isPhone?: boolean;
};

export function AddToCartControls({
  productId,
  productName,
  image,
  variants,
  basePrice,
  isPhone,
}: Props) {
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState<string | undefined>(variants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === variantId);
  const price = Number(selectedVariant?.priceOverride ?? basePrice);

  function handleAdd() {
    addItem(
      {
        productId,
        variantId,
        productName,
        variantName: selectedVariant?.name,
        price,
        image,
        isPhone,
      },
      quantity
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="space-y-3">
      {variants.length > 0 && (
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}

      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="min-h-11 w-20 rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
        />
        <Button onClick={handleAdd} className="flex-1">
          {justAdded ? (
            <>
              <Check size={18} /> Ajouté
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> Ajouter au panier
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
