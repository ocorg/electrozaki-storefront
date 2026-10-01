// Shape of one language's repair content. Every language must cover every
// topic slug (a missing one is a build error).

export const REPAIR_SLUGS = [
  "ecran",
  "batterie",
  "connecteur",
  "camera",
  "son",
  "reseau",
  "logiciel-bloque",
  "mise-a-jour",
  "donnees",
  "compte-configuration",
  "consultation-en-ligne",
] as const;
export type RepairSlug = (typeof REPAIR_SLUGS)[number];

export type RepairFaqEntry = { question: string; answer: string };
export type RepairFaqBrandSection = { brand: string; entries: RepairFaqEntry[] };

export type RepairTopicText = {
  title: string;
  shortTitle: string;
  cardDescription: string;
  intro: string;
  brands: RepairFaqBrandSection[];
};

export type RepairTopicsText = Record<RepairSlug, RepairTopicText>;
