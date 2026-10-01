import type { Locale } from "../config";
import { fr, type Dictionary } from "./fr";
import { ar } from "./ar";
import { en } from "./en";
import { darija } from "./darija";

export type { Dictionary };

// Interface strings for every language. French is the source: the other
// dictionaries are typed `Dictionary`, so a missing or misspelled key is a
// build error rather than a blank on the live site. Client-safe (the
// browser components read it through I18nProvider), so long-form content
// like the repair FAQs lives elsewhere, server-side only.
export const DICTIONARIES: Record<Locale, Dictionary> = { fr, ar, en, darija };
