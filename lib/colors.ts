// Colour names come from the ERP in French, as typed at purchase ("Vert
// Alpin", "Bleu Sierra", "Titane Noir"…). This turns them into a swatch
// colour for the colour picker — by keyword, most specific first. Unknown
// names get a neutral swatch; the name is always shown next to it anyway.
const SWATCHES: [RegExp, string][] = [
  // Pochette colours (owner, 2026-11-03): two-colour names show their first colour
  [/^turquoise/, "#3fbfb7"],
  [/^kaki/, "#6b6b3a"],
  [/camel|fauve/, "#b07a45"],
  [/^marron|^brun|chocolat/, "#6b4430"],
  [/ecru|ecossais/, "#e3d6bc"],
  [/transparent/, "#eef3f6"],
  [/chrome/, "#b9bcc2"],
  [/multicolore/, "conic-gradient(#e8784a, #f2d15c, #4f8a63, #3d6fb0, #8d6fb8, #e8784a)"],
  [/titane\s*noir|noir\s*titane/, "#3b3a38"],
  [/titane\s*(naturel)?$|titane/, "#9c958c"],
  [/lumi[eè]re\s*stellaire|starlight|cr[eè]me|ivoire|beige/, "#efe6d6"],
  [/minuit|midnight/, "#1f2833"],
  [/graphite/, "#4a4a4c"],
  [/noir|black/, "#1d1d1f"],
  [/blanc|white/, "#f5f5f2"],
  // French names used since the colour clean-up (owner, 2026-10-29)
  [/bordeaux|bourgogne|cerise|cramoisi|prune/, "#6e1f2e"],
  [/glacier|glace|brume|ciel/, "#b9d3e6"],
  [/sauge|pistache/, "#a7b89a"],
  [/cuivre|bronze/, "#a8683c"],
  [/sable|champagne/, "#d9c7a3"],
  [/bleu\s*sierra|sierra/, "#9bb5ce"],
  [/bleu\s*(fonc[eé]|nuit|marine)|navy/, "#1f3a5f"],
  [/bleu|blue/, "#3d6fb0"],
  [/vert\s*alpin|alpin/, "#586b5c"],
  [/olive/, "#7b7d52"],
  [/vert|green|menthe/, "#4f8a63"],
  [/rose|pink/, "#f1c4cc"],
  [/rouge|red/, "#c0392b"],
  [/violet|mauve|lavande|purple/, "#8d6fb8"],
  [/jaune|yellow/, "#f2d15c"],
  [/or\b|dor[eé]|gold/, "#d5b36c"],
  [/argent|silver/, "#c8cbd0"],
  [/gris|gray|grey/, "#8e9196"],
  [/orange|corail|coral/, "#e8784a"],
];

export function swatch(name: string | null | undefined): string {
  const n = (name ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  for (const [re, hex] of SWATCHES) {
    if (re.test(n)) return hex;
  }
  return "#d4d4d4";
}

// The accessory colour list (owner, 2026-11-04), copied here by the ERP: a
// colour's real dot and its name in each language. Client-safe.
export type PaletteColor = { name: string; nameEn: string | null; nameAr: string | null; hex: string; motif: string | null };

/** CSS background of a colour's dot: its colour, or a pattern for clear / multicolour / tartan. */
export function paletteBackground(c: Pick<PaletteColor, "hex" | "motif"> | null | undefined, fallbackName?: string): string {
  if (!c) return swatch(fallbackName);
  if (c.motif === "transparent") return "repeating-conic-gradient(#e6eaee 0 25%, #ffffff 0 50%) 50% / 8px 8px";
  if (c.motif === "multicolore") return "conic-gradient(#e8784a, #f2d15c, #4f8a63, #3d6fb0, #8d6fb8, #e8784a)";
  if (c.motif === "ecossais") return `repeating-linear-gradient(0deg, rgba(160,40,40,.35) 0 2px, transparent 2px 7px), repeating-linear-gradient(90deg, rgba(40,40,40,.25) 0 2px, transparent 2px 7px), ${c.hex}`;
  return c.hex;
}

/** The colour's name for the visitor: Arabic, English, else the French name (French and Darija pages). */
export function paletteName(c: PaletteColor, locale: string): string {
  if (locale === "ar" && c.nameAr) return c.nameAr;
  if (locale === "en" && c.nameEn) return c.nameEn;
  return c.name;
}
