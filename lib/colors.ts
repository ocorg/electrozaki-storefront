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
