// Buying guides (/guides/<slug>): the questions people ask before buying a
// used phone, answered with what the shop actually does. Server-only text,
// one file per language. Inline marks in any string: [[Réglages › Batterie]]
// is a settings path (shown in a chip), **text** is bold.

export const GUIDE_SLUGS = ["verifier-iphone-occasion", "pieces-origine-ou-remplacees", "sante-batterie-iphone"] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export type GuideSection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  /** paragraphs after the list */
  after?: string[];
};

export type Guide = {
  /** card and page eyebrow, e.g. "Guide d'achat" */
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: GuideSection[];
  shopTitle: string;
  shop: string;
};

export type GuidesText = {
  indexTitle: string;
  indexMetaTitle: string;
  indexMetaDescription: string;
  indexIntro: string;
  eyebrow: string;
  read: string;
  updated: string;
  others: string;
  /** guide 2's price example, from live stock: replaces {prices} in it */
  priceExample: (model: string, replaced: string, original: string) => string;
  guides: Record<GuideSlug, Guide>;
};
