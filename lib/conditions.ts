// Phase-2 4-tier grading standard (replaces the earlier NEW/REFURBISHED/USED).
// Shared by ProductCard and the product detail page so the labels can't
// drift between the catalog grid and the PDP.
export const CONDITION_LABEL: Record<string, string> = {
  NEUF: "Neuf",
  TRES_BON: "Très bon état",
  BON: "Bon état",
  PIECES_REMPLACEES: "Pièces remplacées",
};

// The grade drawn as a phone's signal bars (4 = Neuf … 1 = pièces
// remplacées): one glance, no legend needed, and it's the store's own
// visual language rather than a generic badge.
export const CONDITION_BARS: Record<string, number> = {
  NEUF: 4,
  TRES_BON: 3,
  BON: 2,
  PIECES_REMPLACEES: 1,
};

// One-line promise per grade, used in the grade legend and on the PDP.
export const CONDITION_HINT: Record<string, string> = {
  NEUF: "Jamais utilisé.",
  TRES_BON: "Très peu de traces d'usage.",
  BON: "Traces d'usage visibles.",
  PIECES_REMPLACEES: "Pièces changées, listées sur la fiche.",
};

// schema.org itemCondition for structured data.
export const CONDITION_SCHEMA: Record<string, string> = {
  NEUF: "https://schema.org/NewCondition",
  TRES_BON: "https://schema.org/UsedCondition",
  BON: "https://schema.org/UsedCondition",
  PIECES_REMPLACEES: "https://schema.org/RefurbishedCondition",
};
