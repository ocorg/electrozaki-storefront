"use client";

import { createContext, use, useContext, useMemo, type ReactNode } from "react";
import { localePath, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Browser components get the language and its texts from here. Each
// language's texts are their own file, loaded on demand: a visitor's browser
// downloads only the page's language, not all four. The page itself arrives
// already written (server-rendered); only its interactivity waits for them.
const LOADERS: Record<Locale, () => Promise<Dictionary>> = {
  fr: () => import("@/lib/i18n/dictionaries/fr").then((m) => m.fr),
  en: () => import("@/lib/i18n/dictionaries/en").then((m) => m.en),
  ar: () => import("@/lib/i18n/dictionaries/ar").then((m) => m.ar),
  darija: () => import("@/lib/i18n/dictionaries/darija").then((m) => m.darija),
};
const loading = new Map<Locale, Promise<Dictionary>>();
function dictionary(locale: Locale): Promise<Dictionary> {
  let p = loading.get(locale);
  if (!p) loading.set(locale, (p = LOADERS[locale]()));
  return p;
}

/** The [lang] layout's provider: the language's texts for every browser component below. */
export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = use(dictionary(locale));
  return (
    <I18nContextProvider locale={locale} t={t}>
      {children}
    </I18nContextProvider>
  );
}
// No default: a default dictionary would put French in every page's bundle.
const I18nContext = createContext<{ locale: Locale; t: Dictionary } | null>(null);

function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("I18nContextProvider missing (app/[lang]/layout.tsx)");
  return value;
}

export function I18nContextProvider({ locale, t, children }: { locale: Locale; t: Dictionary; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

export function useT(): Dictionary {
  return useI18n().t;
}

/** Prefixes an internal path with the current language: "/cart" → "/ar/cart". */
export function useLocalePath(): (path: string) => string {
  const { locale } = useI18n();
  return useMemo(() => (path: string) => localePath(locale, path), [locale]);
}
