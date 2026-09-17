"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

// Deliberately minimal for the review deploy — the real logo/nav/footer
// carry over from the current Shopify theme as-is once ported (per the
// brand-visuals assumption), not rebuilt from scratch here.
export function Header() {
  const { totalItems } = useCart();

  return (
    <header className="flex items-center justify-between border-b border-black/10 px-4 py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        ELECTRO <span className="text-[#c8922a]">ZAKI</span>
      </Link>
      <Link href="/cart" className="text-sm font-medium">
        Panier{totalItems > 0 ? ` (${totalItems})` : ""}
      </Link>
    </header>
  );
}
