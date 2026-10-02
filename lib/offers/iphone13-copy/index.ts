import type { Locale } from "@/lib/i18n/config";
import { fr, type OfferCopy } from "./fr";
import { ar } from "./ar";
import { en } from "./en";
import { darija } from "./darija";

export type { OfferCopy, OfferFormCopy } from "./fr";

// Server-only: the page hands the browser just its own language's form text.
export const OFFER_COPY: Record<Locale, OfferCopy> = { fr, ar, en, darija };

type Labeled = { key: string; name: string };

/** An accessory's label in the page copy (by slug), else its ERP name. */
export function itemTitle(items: Record<string, { title: string }>, a: Labeled): string {
  return items[a.key]?.title ?? a.name;
}

/** "coque transparente + verre trempé" for sentences, or null when nothing is free. */
export function giftList(copy: OfferCopy, included: Labeled[], locale: Locale): string | null {
  if (!included.length) return null;
  const latin = locale !== "ar";
  return included
    .map((a) => itemTitle(copy.form.items, a))
    // Mid-sentence in French/English/Darija: "coque", not "Coque" (but "iPhone" stays).
    .map((t) => (latin && /^[A-ZÀ-Ý][a-zà-ÿ]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t))
    .join(" + ");
}
