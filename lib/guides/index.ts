import type { Locale } from "@/lib/i18n/config";
import { ar } from "./ar";
import { darija } from "./darija";
import { en } from "./en";
import { fr } from "./fr";
import { GUIDE_SLUGS, type GuideSlug, type GuidesText } from "./types";

export { GUIDE_SLUGS, type GuideSlug };

const GUIDES: Record<Locale, GuidesText> = { fr, ar, en, darija };

/** Server-only: the guides' text in one language. */
export function guidesText(locale: Locale): GuidesText {
  return GUIDES[locale];
}

export function isGuideSlug(value: string): value is GuideSlug {
  return (GUIDE_SLUGS as readonly string[]).includes(value);
}
