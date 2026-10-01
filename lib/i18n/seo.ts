import { LOCALE_META, LOCALES, localePath, type Locale } from "./config";

/**
 * A page's canonical address in its own language, plus its other-language
 * versions for search engines (hreflang). `path` is unprefixed:
 * alternates("fr", "/products/x") → canonical "/fr/products/x", languages
 * { fr: "/fr/products/x", ar: "/ar/products/x", en: …, "x-default": /fr… }.
 * Darija has no hreflang code, so it isn't listed (see LOCALE_META).
 */
export function alternates(locale: Locale, path: string): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    const code = LOCALE_META[l].hreflang;
    if (code) languages[code] = localePath(l, path);
  }
  languages["x-default"] = localePath("fr", path);
  return { canonical: localePath(locale, path), languages };
}
