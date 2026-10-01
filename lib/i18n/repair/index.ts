import { REPAIR_ICONS, REPAIR_SLUGS, type RepairTopic } from "@/lib/repair-faq";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";
import type { RepairSlug, RepairTopicsText } from "./types";
import { fr } from "./fr";
import { ar } from "./ar";
import { en } from "./en";
import { darija } from "./darija";

// Server-only: the long-form repair content never goes to the browser.
const TEXT: Record<Locale, RepairTopicsText> = { fr, ar, en, darija };

export function repairTopicsFor(locale: Locale): Record<RepairSlug, RepairTopic> {
  const text = TEXT[locale];
  return Object.fromEntries(
    REPAIR_SLUGS.map((slug) => [slug, { ...text[slug], slug, icon: REPAIR_ICONS[slug] }])
  ) as Record<RepairSlug, RepairTopic>;
}

/** Repair topics in the current page's language. */
export async function getRepairTopics(): Promise<Record<RepairSlug, RepairTopic>> {
  return repairTopicsFor(await getLocale());
}
