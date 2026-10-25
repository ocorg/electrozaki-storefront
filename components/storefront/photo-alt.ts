import type { Dictionary } from "@/lib/i18n/dictionaries";
import { colorName } from "@/lib/i18n/labels";

/**
 * A phone photo's description for search engines and screen readers:
 * "iPhone 13 - Rouge" when the photo's colour is known, else
 * "iPhone 13 - Photo 2". Client-safe.
 */
export function photoAlt(t: Dictionary, name: string, color: string | null | undefined, index: number): string {
  return color ? `${name} - ${colorName(t, color)}` : `${name} - ${t.pdp.photo(index + 1)}`;
}
