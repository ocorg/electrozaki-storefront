// What a customer picks on an accessory family's page (owner, 2026-11-03):
// a design (when the family has several), a colour, then a phone model.
// Every photo says its design, colour and the phone shape it is made for, so
// the colours follow the design and the models follow the colour. Pure: the
// product page and the order check (lib/db/cart-pricing) share it.

/** The camera opening a case is cut for. Each shape is a different case design. */
export type PhoneShape = "carre" | "pilule" | "plateau";

// carre = square camera block (iPhone 11 → 15, 16 Pro / Pro Max),
// pilule = tall narrow camera (16, 16 Plus, 17), plateau = full-width camera bar (17 Pro / Pro Max).
export const PHONE_SHAPES: Record<PhoneShape, string[]> = {
  carre: [
    "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
    "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
    "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
    "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
    "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
    "iPhone 16 Pro", "iPhone 16 Pro Max",
  ],
  pilule: ["iPhone 16", "iPhone 16 Plus", "iPhone 17"],
  plateau: ["iPhone 17 Pro", "iPhone 17 Pro Max"],
};

export type ChoicePhoto = { color?: string | null; design?: string | null; shape?: string | null };
export type ChoiceModel = { key: string; name: string };
export type ChoiceSelection = { design?: string | null; color?: string | null; model?: string | null };

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const uniq = (list: (string | null | undefined)[]) => [...new Set(list.filter((v): v is string => Boolean(v)))];

/** What can be chosen, given what is already chosen. */
export function accessoryChoices(photos: ChoicePhoto[], models: ChoiceModel[], sel: ChoiceSelection) {
  const designs = uniq(photos.map((p) => p.design));
  // with several designs, the colours wait for the design
  const pool = designs.length > 0 ? photos.filter((p) => sel.design && p.design === sel.design) : photos;
  const colors = uniq(pool.map((p) => p.color));
  const matching = sel.color ? pool.filter((p) => p.color === sel.color) : pool;
  let allowed = models;
  if (matching.length > 0 && matching.every((p) => p.shape && p.shape in PHONE_SHAPES)) {
    const names = new Set(matching.flatMap((p) => PHONE_SHAPES[p.shape as PhoneShape]).map(norm));
    allowed = models.filter((m) => names.has(norm(m.name)));
  }
  return { designs, colors, models: allowed };
}

/** The order check: null when the choice is complete and possible, else what to tell the customer. */
export function choiceProblem(photos: ChoicePhoto[], models: ChoiceModel[], sel: ChoiceSelection, productName: string): string | null {
  const designs = uniq(photos.map((p) => p.design));
  if (sel.design && !designs.includes(sel.design)) return `Le design choisi pour « ${productName} » n'est plus proposé. Merci de le choisir à nouveau.`;
  if (designs.length > 0 && !sel.design) return `Merci de choisir le design de « ${productName} ».`;
  const c = accessoryChoices(photos, models, sel);
  if (sel.color && !c.colors.includes(sel.color)) return `La couleur choisie pour « ${productName} » n'est plus proposée. Merci de la choisir à nouveau.`;
  if (c.colors.length > 0 && !sel.color) return `Merci de choisir la couleur de « ${productName} ».`;
  if (sel.model && !c.models.some((m) => m.key === sel.model)) return `Le modèle choisi pour « ${productName} » n'existe pas dans cette couleur. Merci de le choisir à nouveau.`;
  if (models.length > 0 && !sel.model) return `Merci de choisir le modèle de téléphone pour « ${productName} ».`;
  return null;
}
