import type { Dictionary } from "./dictionaries";
import { COLOR_PHRASES } from "./dictionaries/color-words";
import { errors as frErrors } from "./dictionaries/fr-errors";

/** A category's name in the visitor's language, or the ERP's own name for a slug with no translation yet. */
export function categoryName(t: Dictionary, slug: string, fallback: string): string {
  return t.categories[slug] ?? fallback;
}

/** A checklist group's question ("Ton style ?") in the visitor's language, or as staff typed it. */
export function facetQuestion(t: Dictionary, group: { key: string; name: string; question: string | null }): string {
  return t.guide.question[group.key] ?? group.question ?? group.name;
}

/** A checklist option's name ("Fleuri") in the visitor's language, or as staff typed it. */
export function facetOptionName(t: Dictionary, groupKey: string, option: { key: string; name: string }): string {
  return t.guide.option[`${groupKey}.${option.key}`] ?? option.name;
}

/** A colour name from the ERP ("Bleu Sierra") in the visitor's language, or as typed. */
export function colorName(t: Dictionary, name: string): string {
  const typed = name.trim();
  const exact = t.colors[typed];
  if (exact) return exact;
  // Word by word (owner, 2026-10-29: colours are typed in French, one name each).
  // The base colour comes first in French ("Noir Fantôme"); English puts it last.
  const words = colorTokens(typed);
  if (words.length === 0) return name;
  const said = words.map((w) => t.colorWords[colorKey(w)] ?? w);
  return (t.colorOrder === "reverse" ? [...said.slice(1).reverse(), said[0]] : said).join(" ");
}

const colorKey = (w: string) => w.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** "Blanc Clair de Lune" → ["Blanc", "Clair de Lune"]: known expressions stay one piece. */
function colorTokens(name: string): string[] {
  const words = name.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const phrase = COLOR_PHRASES.find((ph) => {
      const n = ph.split(" ").length;
      return colorKey(words.slice(i, i + n).join(" ")) === ph;
    });
    const n = phrase ? phrase.split(" ").length : 1;
    out.push(words.slice(i, i + n).join(" "));
    i += n - 1;
  }
  return out;
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
  for (const [key, french] of Object.entries(frErrors)) {
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
