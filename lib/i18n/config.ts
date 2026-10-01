// The site's languages. Every page lives under its language prefix
// (/fr, /ar, /en, /darija); proxy.ts sends unprefixed addresses there.
// Client-safe: no server-only imports.

export const LOCALES = ["fr", "ar", "en", "darija"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

/** Remembers a visitor's explicit choice from the language switcher. */
export const LOCALE_COOKIE = "ez_lang";

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

type LocaleMeta = {
  /** Name in its own language, for the switcher. */
  label: string;
  /** Two-letter badge for the switcher. */
  short: string;
  /** <html lang>. Darija written in Latin letters: Moroccan Arabic (ary), Latin script. */
  htmlLang: string;
  dir: "ltr" | "rtl";
  /** Locale for Intl dates/times. Darija readers use French date names. */
  intl: string;
  ogLocale: string;
  /**
   * hreflang for search engines, or null: hreflang only accepts ISO 639-1
   * codes, and Moroccan Arabic has none — Darija pages are still indexed,
   * they just aren't declared as a translation of the others.
   */
  hreflang: string | null;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  fr: { label: "Français", short: "FR", htmlLang: "fr-MA", dir: "ltr", intl: "fr-MA", ogLocale: "fr_MA", hreflang: "fr" },
  ar: { label: "العربية", short: "ع", htmlLang: "ar-MA", dir: "rtl", intl: "ar-MA", ogLocale: "ar_MA", hreflang: "ar" },
  en: { label: "English", short: "EN", htmlLang: "en", dir: "ltr", intl: "en-GB", ogLocale: "en_GB", hreflang: "en" },
  darija: { label: "Darija", short: "DA", htmlLang: "ary-Latn", dir: "ltr", intl: "fr-MA", ogLocale: "fr_MA", hreflang: null },
};

/**
 * "/collections/x" → "/ar/collections/x". External links, anchors and
 * already-prefixed paths are returned unchanged.
 */
export function localePath(locale: Locale, path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const first = path.split(/[/?#]/)[1];
  if (isLocale(first)) return path;
  if (path === "/") return `/${locale}`;
  if (path.startsWith("/?") || path.startsWith("/#")) return `/${locale}${path.slice(1)}`;
  return `/${locale}${path}`;
}

/** "/ar/collections/x" → { locale: "ar", path: "/collections/x" }. */
export function splitLocale(pathname: string): { locale: Locale | null; path: string } {
  const first = pathname.split("/")[1];
  if (!isLocale(first)) return { locale: null, path: pathname };
  const rest = pathname.slice(first.length + 1);
  return { locale: first, path: rest || "/" };
}
