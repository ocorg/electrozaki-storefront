import type { Locale } from "@/lib/i18n/config";
import type { TermsCopy } from "./types";
import { fr } from "./fr";
import { ar } from "./ar";
import { en } from "./en";
import { darija } from "./darija";

export type { TermsCopy };

/** When the terms last changed (shown on the page): update with the texts. */
export const TERMS_UPDATED = "2026-10-24";

// Server-side only (long texts): the page reads them, the checkout links to them.
export const TERMS: Record<Locale, TermsCopy> = { fr, ar, en, darija };
