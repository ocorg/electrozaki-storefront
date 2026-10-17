// Shared by the server (spec-sheet.ts) and the browser (offer page, the
// "Fiche de l'appareil"): no imports, so nothing server-side follows it.

export type SpecRow = { label: string; value: string };

/** Placeholder value an offer page fills with the chosen phone's storage. */
export const STORAGE_SLOT = "{storage}";
