import { lang } from "next/root-params";
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from "./config";
import { DICTIONARIES, type Dictionary } from "./dictionaries";

// Server Components read the language from the URL's /[lang] segment with
// next/root-params — no prop drilling. (Not available in Server Actions or
// Route Handlers: those receive the locale from the page instead.)

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getT(): Promise<Dictionary> {
  return DICTIONARIES[await getLocale()];
}

/** Prefixes an internal path with the current language: "/cart" → "/ar/cart". */
export async function getLocalePath(): Promise<(path: string) => string> {
  const locale = await getLocale();
  return (path: string) => localePath(locale, path);
}
