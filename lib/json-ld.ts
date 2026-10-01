import { createElement } from "react";
import { SHOP, SITE_URL, WHATSAPP_URL, absoluteUrl } from "@/lib/site";
import { LOCALE_META, localePath, type Locale } from "@/lib/i18n/config";

// schema.org structured data (Google rich results): the store itself on
// every page, breadcrumbs on catalogue pages, FAQ on repair topics. Each
// carries the page's language, and its URLs point at that language.

type Json = Record<string, unknown>;

/** Renders a JSON-LD script. `<` is escaped so data can't close the tag. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  });
}

export function storeJsonLd(locale: Locale): Json {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": `${SITE_URL}/#store`,
    name: SHOP.name,
    url: absoluteUrl(localePath(locale, "/")),
    inLanguage: LOCALE_META[locale].htmlLang,
    logo: absoluteUrl("/logo-mark.png"),
    image: absoluteUrl("/opengraph-image"),
    telephone: `+${SHOP.whatsappNumber}`,
    sameAs: [WHATSAPP_URL],
    address: {
      "@type": "PostalAddress",
      addressLocality: SHOP.city,
      addressCountry: SHOP.country,
    },
    areaServed: { "@type": "Country", name: "Maroc" },
    currenciesAccepted: "MAD",
    paymentAccepted: "Cash, Bank transfer",
  };
}

/** Breadcrumbs; `path`s are unprefixed ("/collections/x") and get the page's language. */
export function breadcrumbJsonLd(locale: Locale, items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(localePath(locale, it.path)),
    })),
  };
}

export function faqJsonLd(locale: Locale, entries: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: LOCALE_META[locale].htmlLang,
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}
