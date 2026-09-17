"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

type Category = { id: string; name: string; slug: string };

export function Header({ categories }: { categories: Category[] }) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          ELECTRO <span className="text-[#c8922a]">ZAKI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="text-sm font-medium text-neutral-700 transition-colors hover:text-[#c8922a]"
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/reparation"
            className="text-sm font-medium text-neutral-700 transition-colors hover:text-[#c8922a]"
          >
            Réparation
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-neutral-700 transition-colors hover:text-[#c8922a]"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <form action="/search" className="hidden items-center sm:flex">
            <input
              type="search"
              name="q"
              placeholder="Rechercher..."
              className="w-40 rounded-l border border-r-0 border-black/20 px-2 py-1.5 text-sm"
            />
            <button
              type="submit"
              aria-label="Rechercher"
              className="rounded-r border border-black/20 bg-black px-2 py-1.5 text-sm text-white"
            >
              🔍
            </button>
          </form>

          <Link href="/cart" className="text-sm font-semibold">
            Panier
            {totalItems > 0 && (
              <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#c8922a] text-xs font-bold text-black">
                {totalItems}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="text-xl md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-black/10 px-4 py-3 md:hidden">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/collections/${c.slug}`}
              className="py-2 text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {c.name}
            </Link>
          ))}
          <Link href="/reparation" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Réparation
          </Link>
          <Link href="/contact" className="py-2 text-sm font-medium" onClick={() => setMenuOpen(false)}>
            Contact
          </Link>
          <form action="/search" className="flex pt-2">
            <input
              type="search"
              name="q"
              placeholder="Rechercher..."
              className="w-full rounded-l border border-r-0 border-black/20 px-2 py-1.5 text-sm"
            />
            <button type="submit" className="rounded-r border border-black/20 bg-black px-3 text-sm text-white">
              🔍
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
