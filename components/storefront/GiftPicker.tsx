"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle2, Gift, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { useT } from "@/components/i18n/I18nProvider";
import { categoryName } from "@/lib/i18n/labels";

type GiftOption = {
  isGiftOption: boolean;
  product: {
    id: string;
    slug: string;
    name: string;
    category: { name: string; slug: string };
    images: { url: string }[];
  };
};

export function GiftPicker({ giftOptions }: { giftOptions: GiftOption[] }) {
  const t = useT();
  const g = t.gift;
  const { addItem } = useCart();
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  // Grouped by category — a phone's gift options span pochettes AND
  // incassables, and the customer picks one of each, not one overall.
  const groups = giftOptions.reduce<Record<string, GiftOption[]>>((acc, option) => {
    const key = option.product.category.slug;
    (acc[key] ??= []).push(option);
    return acc;
  }, {});

  const [selections, setSelections] = useState<Record<string, string>>({});

  function confirm() {
    for (const [slug, productId] of Object.entries(selections)) {
      const option = groups[slug]?.find((o) => o.product.id === productId);
      if (!option) continue;
      addItem(
        {
          productId: option.product.id,
          productName: `${option.product.name} ${g.suffix}`,
          price: 0,
          image: option.product.images[0]?.url,
          isGift: true,
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
        <Gift size={16} className="text-gold-deep" />
        {g.title}
      </p>
      <p className="mt-1 text-sm text-neutral-600">
        {g.intro(Object.keys(groups).length > 1)}
      </p>

      {added ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-green-700">
          <CheckCircle2 size={16} />
          {g.added}
        </p>
      ) : (
        <Button type="button" variant="accent" size="sm" onClick={() => setOpen(true)} className="mt-3">
          {g.choose}
        </Button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="animate-in max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{g.dialogTitle}</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.common.close}
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
              >
                <X size={20} />
              </button>
            </div>

            {Object.entries(groups).map(([slug, options]) => (
              <div key={slug} className="mt-4">
                <p className="mb-2 text-sm font-semibold text-neutral-500">
                  {categoryName(t, slug, options[0].product.category.name)}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {options.map((o) => {
                    const isSelected = selections[slug] === o.product.id;
                    return (
                      <button
                        key={o.product.id}
                        type="button"
                        onClick={() =>
                          setSelections((prev) => ({ ...prev, [slug]: o.product.id }))
                        }
                        className={`rounded-xl border bg-white p-2 text-start shadow-sm transition-colors ${
                          isSelected ? "border-gold bg-gold/5" : "border-neutral-300 hover:border-gold"
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-50">
                          {o.product.images[0] ? (
                            <Image
                              src={o.product.images[0].url}
                              alt={o.product.name}
                              fill
                              className="object-contain p-2"
                            />
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs font-medium leading-snug">{o.product.name}</p>
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
              {g.confirm}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
