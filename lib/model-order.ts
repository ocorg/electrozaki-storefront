// The order of the phone models on the site ("Par modèle" buttons): by
// brand, then newest model first within the brand. "Newest" is read from
// the name: the series letter (Samsung: S before Z, A, M, Tab) and the
// model number (iPhone 18 before 17, Galaxy S25 before S24); within one
// number, the top version first (Ultra / Pro Max, Pro, Plus, base).

const BRAND_ORDER = ["apple", "samsung", "xiaomi", "honor", "realme", "infinix", "oppo", "tecno"];
const SAMSUNG_SERIES = ["s", "z", "a", "m", "tab"];

type Named = { name: string; brandKey: string };

function parts(name: string) {
  const n = name.toLowerCase();
  // "galaxy s24 ultra" → series "s", number 24; "iphone 13 pro" → "", 13;
  // "galaxy tab a9" → "tab"; "iphone xr" → no number.
  const tab = /\btab\b/.test(n);
  const m = n.match(/\b([a-z]{0,2})(\d{1,3})\b/);
  const series = tab ? "tab" : (m?.[1] ?? "");
  const num = m ? Number(m[2]) : -1;
  const tier = /\bultra\b|pro max|\bmax\b/.test(n) ? 0 : /\bpro\b/.test(n) ? 1 : /\bplus\b|\+/.test(n) ? 2 : /\blite\b|\be\b/.test(n) ? 4 : 3;
  return { series, num, tier };
}

export function byBrandThenNewest(a: Named, b: Named): number {
  const rank = (k: string) => {
    const i = BRAND_ORDER.indexOf(k.toLowerCase());
    return i === -1 ? BRAND_ORDER.length : i;
  };
  if (rank(a.brandKey) !== rank(b.brandKey)) return rank(a.brandKey) - rank(b.brandKey);
  if (a.brandKey !== b.brandKey) return a.brandKey.localeCompare(b.brandKey);
  const pa = parts(a.name);
  const pb = parts(b.name);
  if (pa.series !== pb.series) {
    if (a.brandKey === "samsung") {
      const sa = SAMSUNG_SERIES.indexOf(pa.series);
      const sb = SAMSUNG_SERIES.indexOf(pb.series);
      return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
    }
    return pa.series.localeCompare(pb.series);
  }
  return pb.num - pa.num || pa.tier - pb.tier || a.name.localeCompare(b.name);
}
