import type { Locale } from "@/lib/i18n/config";
import { fr, type OfferCopy } from "./fr";
import { ar } from "./ar";
import { en } from "./en";
import { darija } from "./darija";

export type { OfferCopy, OfferFormCopy } from "./fr";

// Server-only: the page hands the browser just its own language's form text.
export const OFFER_COPY: Record<Locale, OfferCopy> = { fr, ar, en, darija };
