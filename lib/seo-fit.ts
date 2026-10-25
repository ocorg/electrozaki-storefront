// What Google shows in its results: about 60 characters of a title and 160
// of a description; the rest is cut ("…Livraison partout au Ma…"). Client-
// safe (the dictionaries use it), no imports.

export const TITLE_MAX = 60;
export const DESC_MAX = 160;
const SUFFIX = " | Electro Zaki";

/** The first (richest) wording that fits, or the shortest one if none does. */
export function fit(max: number, ...variants: string[]): string {
  return variants.find((v) => v.length <= max) ?? variants.reduce((a, b) => (b.length < a.length ? b : a));
}

/**
 * A page title for Next's metadata: with " | Electro Zaki" (the layout's
 * template) when that still fits, alone otherwise, so the words people
 * search for are never the part Google cuts.
 */
export function pageTitle(core: string): string | { absolute: string } {
  return core.length + SUFFIX.length <= TITLE_MAX ? core : { absolute: core };
}

/** A description that fits, cut after a whole word as a last resort. */
export function clipDescription(text: string, max = DESC_MAX): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const end = cut.lastIndexOf(" ");
  return `${cut.slice(0, end > max * 0.6 ? end : cut.length).replace(/[\s,;:.–-]+$/, "")}…`;
}
