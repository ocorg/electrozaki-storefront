"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, Home, ShoppingBag, Smartphone, Wrench, type LucideIcon } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

// Phones only: an app-style tab bar within thumb reach, so the four things
// people come for are one tap away from anywhere on the site.
const TABS: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: "/", label: "Accueil", icon: Home, match: (p) => p === "/" },
  { href: "/collections/telephones", label: "Téléphones", icon: Smartphone, match: (p) => p.startsWith("/collections/telephones") },
  {
    href: "/collections/accessoires",
    label: "Accessoires",
    icon: Headphones,
    match: (p) => p.startsWith("/collections/") && !p.startsWith("/collections/telephones"),
  },
  { href: "/reparation", label: "Réparation", icon: Wrench, match: (p) => p.startsWith("/reparation") },
  { href: "/cart", label: "Panier", icon: ShoppingBag, match: (p) => p.startsWith("/cart") },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav
      aria-label="Raccourcis"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-paper/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors ${
                  active ? "text-ink" : "text-neutral-500"
                }`}
              >
                <span
                  className={`relative flex h-8 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-gold/20" : ""}`}
                >
                  <t.icon size={20} strokeWidth={active ? 2.4 : 2} aria-hidden />
                  {t.href === "/cart" && totalItems > 0 && (
                    <span className="absolute -top-0.5 right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                      {totalItems}
                    </span>
                  )}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
