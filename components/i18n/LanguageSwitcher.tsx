"use client";

import { useEffect, useId, useRef, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALE_COOKIE, LOCALE_META, LOCALES, splitLocale, type Locale } from "@/lib/i18n/config";
import { useLocale, useT } from "@/components/i18n/I18nProvider";

// Same page, other language: /ar/products/x ↔ /fr/products/x. The choice
// is remembered in a cookie, which proxy.ts uses when someone opens an
// address without a language prefix.
function remember(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function useTargets() {
  const { path } = splitLocale(usePathname());
  return LOCALES.map((l) => ({ locale: l, href: `/${l}${path === "/" ? "" : path}`, ...LOCALE_META[l] }));
}

/** Header pill + menu (desktop). */
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useT();
  const targets = useTargets();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`${t.common.chooseLanguage} (${LOCALE_META[locale].label})`}
        className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-ink transition-colors hover:bg-ink/5"
      >
        <Globe size={18} aria-hidden />
        <span className="readout">{LOCALE_META[locale].short}</span>
        <ChevronDown size={14} aria-hidden className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          id={menuId}
          className="animate-in absolute inset-e-0 top-full z-50 mt-2 w-52 rounded-2xl border border-ink/10 bg-white p-1.5 shadow-[0_30px_60px_-25px_rgb(17_16_19/0.45)]"
        >
          {targets.map((l) => {
            const on = l.locale === locale;
            return (
              <li key={l.locale}>
                <NextLink
                  href={l.href}
                  hrefLang={l.htmlLang}
                  lang={l.htmlLang}
                  dir={l.dir}
                  aria-current={on ? "true" : undefined}
                  onClick={() => {
                    remember(l.locale);
                    setOpen(false);
                  }}
                  className={`flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 text-[15px] font-semibold transition-colors ${
                    on ? "bg-paper text-ink" : "text-neutral-700 hover:bg-paper hover:text-ink"
                  }`}
                >
                  <span>{l.label}</span>
                  {on && <Check size={16} aria-hidden className="text-gold-deep" />}
                </NextLink>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Row of language chips (mobile menu). */
export function LanguageChips() {
  const locale = useLocale();
  const t = useT();
  const targets = useTargets();
  return (
    <div>
      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-500">{t.common.language}</p>
      <ul className="mt-3 grid grid-cols-4 gap-2">
        {targets.map((l) => {
          const on = l.locale === locale;
          return (
            <li key={l.locale}>
              <NextLink
                href={l.href}
                hrefLang={l.htmlLang}
                lang={l.htmlLang}
                aria-current={on ? "true" : undefined}
                onClick={() => remember(l.locale)}
                className={`flex min-h-11 items-center justify-center rounded-2xl px-2 text-sm font-bold transition-colors ${
                  on ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/5"
                }`}
              >
                {l.label}
              </NextLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
