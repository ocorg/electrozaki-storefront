import { createElement } from "react";
import { SHOP, SITE_URL, WHATSAPP_URL, absoluteUrl } from "@/lib/site";

// schema.org structured data (Google rich results): the store itself on
// every page, breadcrumbs on catalogue pages, FAQ on repair topics.

type Json = Record<string, unknown>;

/** Renders a JSON-LD script. `<` is escaped so data can't close the tag. */
export function JsonLd({ data }: { data: Json | Json[] }) {
  return createElement("script", {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data).replace(/</g, "\\u003c") },
  });
}

export function storeJsonLd(): Json {
  return {
    "@context": "https://schema.org",
    "@type": "MobilePhoneStore",
    "@id": `${SITE_URL}/#store`,
    name: SHOP.name,
    url: SITE_URL,
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

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqJsonLd(entries: { question: string; answer: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}
