"use client";

import { useState } from "react";
import { useCart } from "./CartContext";

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
          className="w-full rounded border border-black/20 px-3 py-2"
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
          className="w-20 rounded border border-black/20 px-3 py-2"
        />
        <button
          onClick={handleAdd}
          className="flex-1 rounded bg-[#121212] px-4 py-3 font-medium text-white transition-colors hover:bg-[#c8922a]"
        >
          {justAdded ? "Ajouté ✓" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
