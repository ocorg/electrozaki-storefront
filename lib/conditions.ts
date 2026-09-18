// Phase-2 4-tier grading standard (replaces the earlier NEW/REFURBISHED/USED).
// Shared by ProductCard and the product detail page so the labels can't
// drift between the catalog grid and the PDP.
export const CONDITION_LABEL: Record<string, string> = {
  NEUF: "Neuf",
  TRES_BON: "Très bon état",
  BON: "Bon état",
  PIECES_REMPLACEES: "Pièces remplacées",
};
