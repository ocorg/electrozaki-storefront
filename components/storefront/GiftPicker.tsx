"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Gift, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";

type GiftOption = {
  isGiftOption: boolean;
  product: {
    id: string;
    slug: string;
    name: string;
    category: { name: string };
    images: { url: string }[];
  };
};

export function GiftPicker({ giftOptions }: { giftOptions: GiftOption[] }) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Grouped by category — a phone's gift options span pochettes AND
  // incassables, and the customer picks one of each, not one overall.
  const groups = giftOptions.reduce<Record<string, GiftOption[]>>((acc, g) => {
    const key = g.product.category.name;
    (acc[key] ??= []).push(g);
    return acc;
  }, {});

  const [selections, setSelections] = useState<Record<string, string>>({});

  function confirm() {
    for (const [categoryName, productId] of Object.entries(selections)) {
      const option = groups[categoryName]?.find((g) => g.product.id === productId);
      if (!option) continue;
      addItem(
        {
          productId: option.product.id,
          productName: `${option.product.name} (cadeau offert)`,
          price: 0,
          image: option.product.images[0]?.url,
        },
        1
      );
    }
    setOpen(false);
    setAdded(true);
  }

  if (giftOptions.length === 0) return null;

  return (
    <div className={cardClasses("mt-4 p-4")}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Gift size={16} className="text-gold" />
        Cadeau offert à l&apos;achat
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        Choisissez {Object.keys(groups).length > 1 ? "vos cadeaux" : "votre cadeau"} parmi les
        modèles compatibles.
      </p>

      {added ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 size={16} />
          Cadeaux ajoutés au panier
        </p>
      ) : (
        <Button type="button" variant="accent" size="sm" onClick={() => setOpen(true)} className="mt-3">
          Choisir mon cadeau
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Choisissez votre cadeau</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            {Object.entries(groups).map(([categoryName, options]) => (
              <div key={categoryName} className="mt-4">
                <p className="mb-2 text-sm font-semibold text-neutral-500">{categoryName}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {options.map((g) => {
                    const isSelected = selections[categoryName] === g.product.id;
                    return (
                      <button
                        key={g.product.id}
                        type="button"
                        onClick={() =>
                          setSelections((prev) => ({ ...prev, [categoryName]: g.product.id }))
                        }
                        className={`rounded-xl border bg-white p-2 text-left shadow-sm transition-colors ${
                          isSelected ? "border-gold bg-gold/5" : "border-neutral-300 hover:border-gold"
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-50">
                          {g.product.images[0] ? (
                            <Image
                              src={g.product.images[0].url}
                              alt={g.product.name}
                              fill
                              className="object-contain p-2"
                            />
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs font-medium leading-snug">{g.product.name}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button
              type="button"
              onClick={confirm}
              disabled={Object.keys(selections).length < Object.keys(groups).length}
              className="mt-6 w-full"
            >
              Confirmer mon choix
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
