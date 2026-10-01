import type { Dictionary } from "./dictionaries";
import { fr } from "./dictionaries/fr";

/** A category's name in the visitor's language, or the ERP's own name for a slug with no translation yet. */
export function categoryName(t: Dictionary, slug: string, fallback: string): string {
  return t.categories[slug] ?? fallback;
}

/** A colour name from the ERP ("Bleu Sierra") in the visitor's language, or as typed. */
export function colorName(t: Dictionary, name: string): string {
  return t.colors[name.trim()] ?? name;
}

// French grade labels as they appear in spec values ("État: Bon état").
const GRADE_BY_FRENCH_LABEL: Record<string, string> = {
  neuf: "NEUF",
  "très bon état": "TRES_BON",
  "bon état": "BON",
  "pièces remplacées": "PIECES_REMPLACEES",
};

/** A spec row from the ERP, translated where the label (and, for "État", the value) is known. */
export function specRow(t: Dictionary, key: string, value: string): { key: string; value: string } {
  const grade = key === "État" ? GRADE_BY_FRENCH_LABEL[value.trim().toLowerCase()] : undefined;
  return { key: t.specKeys[key] ?? key, value: grade ? (t.grades.label[grade] ?? value) : value };
}

// The French texts the server sends, and for the ones that carry a value
// ("Stock insuffisant pour « X »…"), how to read that value back out.
const ERROR_PATTERNS: [RegExp, (t: Dictionary, value: string) => string][] = [
  [/^Merci de choisir une option pour « (.+) »\.$/, (t, v) => t.errors.chooseOption(v)],
  [/^Stock insuffisant pour « (.+) »\. Merci de réduire la quantité\.$/, (t, v) => t.errors.lowStock(v)],
  [/^Ce code nécessite un panier d'au moins (.+) MAD\.$/, (t, v) => t.errors.promoMin(v)],
];

/** A server message (always French) in the visitor's language; unknown messages pass through as sent. */
export function translateError(t: Dictionary, message: string): string {
  for (const [key, french] of Object.entries(fr.errors)) {
    if (french === message) {
      const translated = t.errors[key as keyof Dictionary["errors"]];
      return typeof translated === "string" ? translated : message;
    }
  }
  for (const [re, render] of ERROR_PATTERNS) {
    const m = message.match(re);
    if (m) return render(t, m[1]);
  }
  return message;
}
