"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, ShoppingBag, Tag, Truck, X } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";
import { LanguageChips, LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useCart } from "@/components/cart/CartContext";
import { SearchBox } from "@/components/storefront/SearchBox";
import { LiveClock } from "@/components/storefront/LiveClock";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { artFor } from "@/lib/category-art";
import { formatMAD } from "@/lib/format";
import { splitLocale } from "@/lib/i18n/config";
import { categoryName } from "@/lib/i18n/labels";
import type { AisleStat } from "@/lib/db/storefront";

type Category = { id: string; name: string; slug: string };
/** A live offer (see lib/offers/live): its page, title and top-bar line. */
type HeaderOffer = { href: string; title: string; bar: string };

/** Pulsing dot that says "on now". */
function LiveDot({ className = "" }: { className?: string }) {
  return (
    <span className={`relative flex h-2 w-2 flex-none ${className}`} aria-hidden>
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
    </span>
  );
}

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
  `relative inline-flex min-h-11 items-center px-1 text-[15px] font-semibold transition-colors after:absolute after:inset-x-1 after:bottom-2 after:h-[2px] after:origin-left rtl:after:origin-right after:scale-x-0 after:rounded-full after:bg-gold after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100 ${
    active ? "text-ink after:scale-x-100" : "text-neutral-700"
  }`;

export function Header({ categories, aisles, offers }: { categories: Category[]; aisles: AisleStat[]; offers: HeaderOffer[] }) {
  const t = useT();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // Active-link checks compare paths without the /fr, /ar… prefix.
  const { path } = splitLocale(pathname);

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
  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);
  const name = (c: { slug: string; name: string }) => categoryName(t, c.slug, c.name);
  // One offer: straight to it. Several: the list.
  const offersHref = offers.length === 1 ? offers[0].href : "/offres";
  const topOffer = offers[0];

  return (
    <>
      {/* Status bar — the site opens like a phone screen. */}
      <div className="on-dark bg-ink text-[12px] text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-4 px-4">
          <span className="flex items-center gap-2">
            <LiveClock className="font-semibold" />
            <span className="hidden text-neutral-300 sm:inline">{t.common.city}</span>
          </span>
          {topOffer ? (
            <Link
              href={topOffer.href}
              className="flex min-w-0 items-center gap-1.5 font-semibold text-gold transition-colors hover:text-gold-bright"
            >
              <Tag size={13} className="flex-none" aria-hidden />
              <span className="truncate">{topOffer.bar}</span>
              <ArrowRight size={13} className="flex-none rtl:rotate-180" aria-hidden />
            </Link>
          ) : (
            <span className="flex min-w-0 items-center gap-1.5 text-neutral-200">
              <Truck size={13} className="flex-none text-gold" aria-hidden />
              <span className="truncate">
                {t.common.deliveryEverywhere}
                <span className="hidden sm:inline"> · {t.common.cashOnDelivery}</span>
              </span>
            </span>
          )}
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
          <Link href="/" className="flex flex-none items-center gap-2.5" aria-label={t.common.homeAria}>
            {/* The mark's Z is white: it sits on an ink squircle. */}
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[30%] bg-ink p-1.5 shadow-[0_6px_14px_-6px_rgb(17_16_19/0.7)]">
              <Image src="/logo-mark.png" alt="" width={28} height={28} priority className="h-full w-full object-contain" />
            </span>
            {/* The wordmark is a logo: always Latin, always left-to-right. */}
            <span dir="ltr" className="hidden font-display text-[1.15rem] font-extrabold leading-none tracking-tight text-ink sm:inline">
              ELECTRO<span className="text-gold-deep"> ZAKI</span>
            </span>
          </Link>

          <nav aria-label={t.common.mainNav} className="hidden items-center gap-5 md:flex">
            {phones && (
              <Link href={`/collections/${phones.slug}`} className={navLink(isActive(`/collections/${phones.slug}`))}>
                {name(phones)}
              </Link>
            )}
            {offers.length > 0 && (
              <Link
                href={offersHref}
                aria-current={isActive("/offres") ? "page" : undefined}
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-gold px-3.5 text-[14px] font-bold text-ink shadow-[0_6px_16px_-8px_rgb(184_145_47/0.9)] transition-[filter,transform] hover:-translate-y-px hover:brightness-105"
              >
                <LiveDot />
                {t.offers.nav}
              </Link>
            )}
            {groups.map((g) => {
              const children = aisles.filter((a) => a.parentSlug === g.slug);
              const active =
                isActive(`/collections/${g.slug}`) || children.some((c) => isActive(`/collections/${c.slug}`));
              if (!children.length) {
                return (
                  <Link key={g.id} href={`/collections/${g.slug}`} className={navLink(active)}>
                    {name(g)}
                  </Link>
                );
              }
              return (
                <div key={g.id} className="group/menu relative">
                  <Link href={`/collections/${g.slug}`} className={`${navLink(active)} gap-1`}>
                    {name(g)}
                    <ChevronDown size={15} className="transition-transform duration-300 group-hover/menu:rotate-180" aria-hidden />
                  </Link>
                  {/* Hover / keyboard-focus mega menu: every aisle with its drawing and "from" price. */}
                  <div className="invisible absolute left-1/2 top-full z-50 w-[560px] -translate-x-1/2 translate-y-2 pt-2 opacity-0 transition-all duration-300 ease-out-quint group-focus-within/menu:visible group-focus-within/menu:translate-y-0 group-focus-within/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100">
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
                            <span className="block text-sm font-semibold text-ink">{name(c)}</span>
                            {c.fromPrice !== null && (
                              <span className="block text-xs text-neutral-500">
                                {t.common.from} <span className="readout font-semibold text-neutral-700">{formatMAD(c.fromPrice)}</span>
                              </span>
                            )}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <Link href="/reparation" className={navLink(isActive("/reparation"))}>
              {t.common.repair}
            </Link>
            <Link href="/contact" className={navLink(isActive("/contact"))}>
              {t.common.contact}
            </Link>
          </nav>

          <div className="ms-auto flex items-center gap-1 sm:gap-2">
            <SearchBox className="hidden w-56 sm:block lg:w-64" placeholder={t.common.searchPlaceholder} />

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            <Link
              href="/cart"
              aria-label={t.common.cartAria(totalItems)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <ShoppingBag size={22} strokeWidth={2} />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute inset-e-0.5 top-0.5 inline-flex h-5 min-w-5 animate-[notif-in_0.5s_var(--ease-spring)] items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-gold-foreground ring-2 ring-paper"
                >
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-ink/5 md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Phones: search always visible under the logo row. */}
        <div className="px-4 pb-3 sm:hidden">
          <SearchBox placeholder={t.common.searchPlaceholder} />
        </div>

        {/* Mobile menu: every aisle as an app-icon grid, then the language. */}
        {menuOpen && (
          <nav
            id="menu-mobile"
            aria-label={t.common.menu}
            className="animate-in max-h-[75vh] overflow-y-auto border-t border-ink/10 bg-paper px-4 pb-6 pt-4 md:hidden"
          >
            {offers.length > 0 && (
              <div className="mb-6 flex flex-col gap-2">
                {offers.slice(0, 2).map((o) => (
                  <Link
                    key={o.href}
                    href={o.href}
                    className="flex min-w-0 items-center gap-3 rounded-2xl bg-gold px-4 py-3 text-ink shadow-[0_10px_24px_-14px_rgb(184_145_47/0.9)]"
                  >
                    <Tag size={20} className="flex-none" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                        <LiveDot /> {t.offers.nav}
                      </span>
                      <span className="block truncate text-sm font-semibold">{o.bar}</span>
                    </span>
                    <ArrowRight size={18} className="flex-none rtl:rotate-180" aria-hidden />
                  </Link>
                ))}
                {offers.length > 2 && (
                  <Link href="/offres" className="text-center text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
                    {t.offers.all}
                  </Link>
                )}
              </div>
            )}
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t.common.aisles}</p>
            <div className="mt-3 grid grid-cols-4 gap-x-2 gap-y-4">
              {aisles.map((a) => (
                <Link key={a.slug} href={`/collections/${a.slug}`} className="flex flex-col items-center gap-1.5 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[30%] bg-white shadow-[0_6px_16px_-10px_rgb(17_16_19/0.5)] ring-1 ring-ink/5">
                    <DeviceArt kind={artFor(a.slug, a.name)} className="h-9 w-9 text-ink" />
                  </span>
                  <span className="line-clamp-2 text-[11px] font-semibold leading-tight text-neutral-800">{name(a)}</span>
                </Link>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {(
                [
                  ["/reparation", t.common.repair],
                  ["/reparation/suivi", t.common.trackRepair],
                  ["/contact", t.common.contact],
                  ["/cart", t.common.myCart],
                ] as const
              ).map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex min-h-12 items-center rounded-2xl bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/5"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <LanguageChips />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
