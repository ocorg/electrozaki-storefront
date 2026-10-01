// Phase-2 4-tier grading standard (NEUF, TRES_BON, BON, PIECES_REMPLACEES).
// The grade names and one-line descriptions are words, so they live in the
// dictionaries (t.grades.label / t.grades.hint); only the language-neutral
// parts stay here.

// The grade drawn as a phone's signal bars (4 = Neuf … 1 = pièces
// remplacées): one glance, no legend needed, and it's the store's own
// visual language rather than a generic badge.
export const CONDITION_BARS: Record<string, number> = {
  NEUF: 4,
  TRES_BON: 3,
  BON: 2,
  PIECES_REMPLACEES: 1,
};

// schema.org itemCondition for structured data.
export const CONDITION_SCHEMA: Record<string, string> = {
  NEUF: "https://schema.org/NewCondition",
  TRES_BON: "https://schema.org/UsedCondition",
  BON: "https://schema.org/UsedCondition",
  PIECES_REMPLACEES: "https://schema.org/RefurbishedCondition",
};
