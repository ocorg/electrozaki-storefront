// An aisle's guided choice (pochettes): what the visitor picked, read from
// the page address, and which products match. Pure: no database here, so
// browser components can use it too.

export type FacetOption = { key: string; name: string; level: number | null };

export type FacetGroup = {
  key: string;
  name: string;
  question: string | null;
  display: "CHIPS" | "TILES" | "METER";
  options: FacetOption[];
};

/** A product's ticks, as PUBLIC_PRODUCT_SELECT returns them. */
export type ProductFacets = { option: { key: string; name: string; level: number | null; sortOrder: number; group: { key: string } } }[];

/** The group that says which phone an accessory is for. */
export const MODEL_GROUP = "modele";

// Address parameters the catalogue already uses: a group can't take one of
// these names (the ERP refuses them too).
export const RESERVED_KEYS = new Set([
  "brand", "condition", "minBattery", "maxPrice", "storage", "type", "fits", "q", "promo", "sort", "page", "budget",
]);

// Accessory budgets, in DH. `max` is included, `min` is not: 50 DH is a
// "petit prix", 100 DH is still in the middle band.
export const BUDGET_BANDS = [
  { key: "petit", min: 0, max: 50 },
  { key: "moyen", min: 50, max: 100 },
  { key: "premium", min: 100, max: null },
] as const;

export type BudgetKey = (typeof BUDGET_BANDS)[number]["key"];

export function budgetOf(price: number): BudgetKey {
  return (BUDGET_BANDS.find((b) => price > b.min && (b.max === null || price <= b.max)) ?? BUDGET_BANDS[0]).key;
}

export function readBudget(value: unknown): BudgetKey | undefined {
  return BUDGET_BANDS.find((b) => b.key === value)?.key;
}

/** One option per group, taken from the address; anything unknown is ignored. */
export function readSelection(groups: FacetGroup[], params: Record<string, unknown>): Record<string, string> {
  const selection: Record<string, string> = {};
  for (const group of groups) {
    const value = params[group.key];
    if (typeof value === "string" && group.options.some((o) => o.key === value)) selection[group.key] = value;
  }
  return selection;
}

export function hasOption(facets: ProductFacets, group: string, option: string): boolean {
  return facets.some((f) => f.option.group.key === group && f.option.key === option);
}

/** Does the product carry every picked option? `except` leaves one group out (to count its options). */
export function matchesSelection(facets: ProductFacets, selection: Record<string, string>, except?: string): boolean {
  return Object.entries(selection).every(([group, option]) => group === except || hasOption(facets, group, option));
}

/** A product's ticks in one group, in the ERP's order. */
export function optionsIn(facets: ProductFacets, group: string): ProductFacets[number]["option"][] {
  return facets
    .filter((f) => f.option.group.key === group)
    .map((f) => f.option)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
