"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";

type Category = { id: string; name: string; slug: string };

const NAV_LINK_CLASSES =
  "text-sm font-medium text-neutral-700 transition-colors hover:text-ink hover:underline hover:decoration-gold hover:decoration-2 hover:underline-offset-4";

export function Header({ categories }: { categories: Category[] }) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          ELECTRO <span className="text-gold">ZAKI</span>
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
          <form action="/search" className="hidden items-center sm:flex">
            <input
              type="search"
              name="q"
              placeholder="Rechercher un téléphone, un accessoire..."
              className="min-h-11 w-56 rounded-l-lg border border-r-0 border-black/15 px-3 text-sm focus:border-gold focus:outline-none lg:w-72"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-r-lg border border-black/15 bg-ink text-white transition-colors hover:bg-neutral-800"
            >
              <Search size={18} />
            </button>
          </form>

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

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/10 px-4 py-3 md:hidden">
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
          <form action="/search" className="flex pt-2">
            <input
              type="search"
              name="q"
              placeholder="Rechercher..."
              className="min-h-11 w-full rounded-l-lg border border-r-0 border-black/15 px-3 text-sm focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-r-lg border border-black/15 bg-ink text-white"
            >
              <Search size={18} />
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
