"use client";

import { usePathname } from "next/navigation";
import { Headphones, Home, ShoppingBag, Smartphone, Wrench, type LucideIcon } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";
import { useCart } from "@/components/cart/CartContext";
import { splitLocale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Phones only: an app-style tab bar within thumb reach, so the four things
// people come for are one tap away from anywhere on the site.
const TABS: { href: string; label: (t: Dictionary) => string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: "/", label: (t) => t.common.home, icon: Home, match: (p) => p === "/" },
  {
    href: "/collections/telephones",
    label: (t) => t.common.phones,
    icon: Smartphone,
    match: (p) => p.startsWith("/collections/telephones"),
  },
  {
    href: "/collections/accessoires",
    label: (t) => t.common.accessories,
    icon: Headphones,
    match: (p) => p.startsWith("/collections/") && !p.startsWith("/collections/telephones"),
  },
  { href: "/reparation", label: (t) => t.common.repair, icon: Wrench, match: (p) => p.startsWith("/reparation") },
  { href: "/cart", label: (t) => t.common.cart, icon: ShoppingBag, match: (p) => p.startsWith("/cart") },
];

export function MobileTabBar() {
  const t = useT();
  const { path } = splitLocale(usePathname());
  const { totalItems } = useCart();

  return (
    <nav
      aria-label={t.common.shortcuts}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.match(path);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-15 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-ink" : "text-neutral-500"
                }`}
              >
                <span
                  className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-gold/20" : ""}`}
                >
                  <tab.icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden />
                  {tab.href === "/cart" && totalItems > 0 && (
                    <span className="absolute -top-0.5 inset-e-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                      {totalItems}
                    </span>
                  )}
                </span>
                {tab.label(t)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
