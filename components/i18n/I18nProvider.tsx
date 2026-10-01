"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import { DICTIONARIES, type Dictionary } from "@/lib/i18n/dictionaries";

// Browser components get the language from here: the [lang] layout passes
// just the locale string, and each component looks up its dictionary.
const LocaleContext = createContext<Locale>("fr");

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useT(): Dictionary {
  return DICTIONARIES[useContext(LocaleContext)];
}

/** Prefixes an internal path with the current language: "/cart" → "/ar/cart". */
export function useLocalePath(): (path: string) => string {
  const locale = useContext(LocaleContext);
  return useMemo(() => (path: string) => localePath(locale, path), [locale]);
}
