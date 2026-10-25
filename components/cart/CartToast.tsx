"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useCart } from "@/components/cart/CartContext";
import { useT } from "@/components/i18n/I18nProvider";

// "Ajouté au panier" with a way to the cart, for a few seconds after an
// item is added (the cart icon's badge alone went unnoticed). Shown at the
// top: the bottom of a phone screen already holds the tab bar and the
// product page's order bar.
const SHOW_MS = 4500;

export function CartToast() {
  const { lastAdded } = useCart();
  const t = useT().cartToast;
  const [shown, setShown] = useState<{ name: string; at: number } | null>(null);

  useEffect(() => {
    if (!lastAdded) return;
    // A new "added" event: show it, then hide it after a few seconds.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShown(lastAdded);
    const timer = setTimeout(() => setShown((s) => (s?.at === lastAdded.at ? null : s)), SHOW_MS);
    return () => clearTimeout(timer);
  }, [lastAdded]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 top-3 z-50 flex justify-center md:inset-x-auto md:inset-e-6 md:top-24">
      {shown && (
        <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-[0_20px_40px_-16px_rgb(17_16_19/0.7)]">
          <CheckCircle2 size={22} aria-hidden className="flex-none text-signal" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">{t.added}</p>
            <p className="truncate text-xs text-neutral-300">{shown.name}</p>
          </div>
          <Link
            href="/cart"
            onClick={() => setShown(null)}
            className="inline-flex min-h-10 flex-none items-center rounded-full bg-gold px-4 text-sm font-bold text-ink"
          >
            {t.view}
          </Link>
          <button
            type="button"
            onClick={() => setShown(null)}
            aria-label={t.close}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-neutral-400 hover:text-white"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
