// The terms of sale (/conditions-de-vente), one file per language. Written
// for law 31-08 (consumer protection, distance selling): seller identity,
// prices, ordering, payment, delivery, the 7-day return right, warranties,
// complaints and personal data. The seller block comes from LEGAL
// (lib/site.ts); the texts here say how the shop works.

export type TermsSection = {
  /** anchor: "retours" is linked from the checkout and from Google's data */
  id: string;
  title: string;
  paragraphs: string[];
  /** a short list after the paragraphs */
  list?: string[];
};

export type TermsCopy = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: (date: string) => string;
  intro: string;
  /** the returns summary at the top */
  summaryTitle: string;
  summary: string[];
  seller: {
    title: string;
    tradeName: string;
    address: string;
    phone: string;
    website: string;
    rc: string;
    ice: string;
    fiscalId: string;
    email: string;
  };
  sections: TermsSection[];
  contactCta: string;
};
