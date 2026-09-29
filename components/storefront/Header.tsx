"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, ShoppingBag, Truck, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { SearchBox } from "@/components/storefront/SearchBox";
import { LiveClock } from "@/components/storefront/LiveClock";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { artFor } from "@/lib/category-art";
import type { AisleStat } from "@/lib/db/storefront";

type Category = { id: string; name: string; slug: string };

/** Decorative signal / wifi / battery glyphs of the status bar. */
function StatusIcons() {
  return (
    <span aria-hidden className="flex items-center gap-1.5">
      <span className="flex items-end gap-[1.5px]">
        {[4, 6, 8, 10].map((h) => (
          <span key={h} className="w-[2.5px] rounded-[1px] bg-white" style={{ height: h }} />
        ))}
      </span>
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round">
        <path d="M1 3.5a9 9 0 0 1 12 0M3.2 5.8a5.8 5.8 0 0 1 7.6 0" />
        <circle cx="7" cy="8.3" r="0.9" fill="white" stroke="none" />
      </svg>
      <span className="relative flex h-[10px] w-[20px] rounded-[3px] border border-white/70 p-[1.5px]">
        <span className="h-full w-[80%] rounded-[1px] bg-gold" />
        <span className="absolute -right-[3px] top-1/2 h-[4px] w-[1.5px] -translate-y-1/2 bg-white/70" />
      </span>
    </span>
  );
}

const navLink = (active: boolean) =>
  `relative inline-flex min-h-11 items-center px-1 text-[15px] font-semibold transition-colors after:absolute after:inset-x-1 after:bottom-2 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-gold after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100 ${
    active ? "text-ink after:scale-x-100" : "text-neutral-700"
  }`;

export function Header({ categories, aisles }: { categories: Category[]; aisles: AisleStat[] }) {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Close the mobile menu when the route changes (tapping a link inside it).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const phones = categories.find((c) => c.slug === "telephones");
  const groups = categories.filter((c) => c.slug !== "telephones");
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {/* Status bar — the site opens like a phone screen. */}
      <div className="on-dark bg-ink text-[12px] text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4">
          <span className="flex items-center gap-2">
            <LiveClock className="font-semibold" />
            <span className="hidden text-neutral-300 sm:inline">Meknès</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-neutral-200">
            <Truck size={13} className="flex-none text-gold" aria-hidden />
            <span className="truncate">
              Livraison partout au Maroc<span className="hidden sm:inline"> · Paiement à la livraison</span>
            </span>
          </span>
          <StatusIcons />
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled
            ? "border-ink/10 bg-paper/85 shadow-[0_10px_30px_-20px_rgb(17_16_19/0.5)] backdrop-blur-xl"
            : "border-transparent bg-paper"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 lg:gap-8">
          <Link href="/" className="flex flex-none items-center gap-2.5" aria-label="Electro Zaki — accueil">
            {/* The mark's Z is white: it sits on an ink squircle. */}
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[30%] bg-ink p-1.5 shadow-[0_6px_14px_-6px_rgb(17_16_19/0.7)]">
              <Image src="/logo-mark.png" alt="" width={28} height={28} priority className="h-full w-full object-contain" />
            </span>
            <span className="hidden font-display text-[1.15rem] font-extrabold leading-none tracking-tight text-ink sm:inline">
              ELECTRO<span className="text-gold-deep"> ZAKI</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-5 md:flex">
            {phones && (
              <Link href={`/collections/${phones.slug}`} className={navLink(isActive(`/collections/${phones.slug}`))}>
                {phones.name}
              </Link>
            )}
            {groups.map((g) => {
              const children = aisles.filter((a) => a.parentSlug === g.slug);
              const active =
                isActive(`/collections/${g.slug}`) || children.some((c) => isActive(`/collections/${c.slug}`));
              if (!children.length) {
                return (
                  <Link key={g.id} href={`/collections/${g.slug}`} className={navLink(active)}>
                    {g.name}
                  </Link>
                );
              }
              return (
                <div key={g.id} className="group/menu relative">
                  <Link href={`/collections/${g.slug}`} className={`${navLink(active)} gap-1`}>
                    {g.name}
                    <ChevronDown size={15} className="transition-transform duration-300 group-hover/menu:rotate-180" aria-hidden />
                  </Link>
                  {/* Hover / keyboard-focus mega menu: every aisle with its drawing and count. */}
                  <div className="invisible absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-300 ease-[var(--ease-out-quint)] group-focus-within/menu:visible group-focus-within/menu:translate-y-0 group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100">
                    <div className="grid grid-cols-2 gap-1 rounded-3xl border border-ink/10 bg-white p-2 shadow-[0_30px_60px_-25px_rgb(17_16_19/0.45)]">
                      {children.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/collections/${c.slug}`}
                          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-paper"
                        >
                          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-[30%] bg-paper">
                            <DeviceArt kind={artFor(c.slug, c.name)} className="h-8 w-8 text-ink" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-ink">{c.name}</span>
                            <span className="block text-xs text-neutral-500">
                              {c.count} article{c.count > 1 ? "s" : ""}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/reparation" className={navLink(isActive("/reparation"))}>
              Réparation
            </Link>
            <Link href="/contact" className={navLink(isActive("/contact"))}>
              Contact
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SearchBox className="hidden w-60 sm:block lg:w-72" placeholder="iPhone 13, coque, chargeur…" />

            <Link
              href="/cart"
              aria-label={totalItems > 0 ? `Panier, ${totalItems} article${totalItems > 1 ? "s" : ""}` : "Panier"}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <ShoppingBag size={22} strokeWidth={2} />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 animate-[notif-in_0.5s_var(--ease-spring)] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-gold-foreground ring-2 ring-paper"
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Phones: search always visible under the logo row. */}
        <div className="px-4 pb-3 sm:hidden">
          <SearchBox placeholder="iPhone 13, coque, chargeur…" />
        </div>

        {/* Mobile menu: every aisle as an app-icon grid. */}
        {menuOpen && (
          <nav
            id="menu-mobile"
            aria-label="Menu"
            className="animate-in max-h-[75vh] overflow-y-auto border-t border-ink/10 bg-paper px-4 pb-6 pt-4 md:hidden"
          >
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Rayons</p>
            <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">
              {aisles.map((a) => (
                <Link key={a.slug} href={`/collections/${a.slug}`} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[30%] bg-white shadow-[0_6px_16px_-10px_rgb(17_16_19/0.5)] ring-1 ring-ink/5">
                    <DeviceArt kind={artFor(a.slug, a.name)} className="h-9 w-9 text-ink" />
                  </span>
                  <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-neutral-800">{a.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {[
                ["/reparation", "Réparation"],
                ["/reparation/suivi", "Suivre ma réparation"],
                ["/contact", "Contact"],
                ["/cart", "Mon panier"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-12 items-center rounded-2xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/5"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
