// Colour names come from the ERP in French, as typed at purchase ("Vert
// Alpin", "Bleu Sierra", "Titane Noir"…). This turns them into a swatch
// colour for the colour picker — by keyword, most specific first. Unknown
// names get a neutral swatch; the name is always shown next to it anyway.
const SWATCHES: [RegExp, string][] = [
  [/titane\s*noir|noir\s*titane/, "#3b3a38"],
  [/titane\s*(naturel)?$|titane/, "#9c958c"],
  [/lumi[eè]re\s*stellaire|starlight|cr[eè]me|ivoire|beige/, "#efe6d6"],
  [/minuit|midnight/, "#1f2833"],
  [/graphite/, "#4a4a4c"],
  [/noir|black/, "#1d1d1f"],
  [/blanc|white/, "#f5f5f2"],
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
