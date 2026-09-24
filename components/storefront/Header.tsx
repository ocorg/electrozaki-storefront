"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { SearchBox } from "@/components/storefront/SearchBox";

type Category = { id: string; name: string; slug: string };

const NAV_LINK_CLASSES =
  "text-sm font-medium text-neutral-700 transition-colors hover:text-ink hover:underline hover:decoration-gold hover:decoration-2 hover:underline-offset-4";

export function Header({ categories }: { categories: Category[] }) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight" aria-label="Electro Zaki — accueil">
          {/* The mark's Z is white: it sits on an ink tile to stay visible on the white header. */}
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-ink p-1.5">
            <Image src="/logo-mark.png" alt="" width={28} height={28} priority className="h-full w-full object-contain" />
          </span>
          <span className="hidden sm:inline">
            ELECTRO <span className="text-gold">ZAKI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((c) => (
            <Link key={c.id} href={`/collections/${c.slug}`} className={NAV_LINK_CLASSES}>
              {c.name}
            </Link>
          ))}
          <Link href="/reparation" className={NAV_LINK_CLASSES}>
            Réparation
          </Link>
          <Link href="/contact" className={NAV_LINK_CLASSES}>
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <SearchBox className="hidden w-64 sm:block lg:w-80" />

          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-ink"
          >
            <ShoppingBag size={20} strokeWidth={2} />
            <span className="hidden sm:inline">Panier</span>
            {totalItems > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-xs font-bold text-gold-foreground">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-neutral-800 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Phones: the search box is always there, under the logo row */}
      <div className="px-4 pb-3 sm:hidden">
        <SearchBox placeholder="Rechercher un téléphone, une coque…" />
      </div>

      {menuOpen && (
        <nav className="animate-in flex flex-col gap-1 border-t border-black/10 px-4 py-3 md:hidden">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-neutral-50"
              onClick={() => setMenuOpen(false)}
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/reparation"
            className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-neutral-50"
            onClick={() => setMenuOpen(false)}
          >
            Réparation
          </Link>
          <Link
            href="/contact"
            className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-neutral-50"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
