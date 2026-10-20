import Link from "@/components/i18n/Link";
import type { WidgetsText } from "@/lib/guides/widgets";
import { formatMAD } from "@/lib/format";
import { getModelPages } from "@/lib/offers/phone-offers";

// Guide 2: for each iPhone model in stock with both kinds of unit, the
// lowest price with replaced parts next to the lowest with original parts
// (very good or good condition), from live stock. Nothing when no model has
// both.
export async function PriceChart({ t }: { t: WidgetsText["prices"] }) {
  const models = await getModelPages();
  const rows = models
    .filter((m) => m.brand.toLowerCase() === "apple")
    .map((m) => {
      const low = (grades: string[]) => {
        const prices = m.units.filter((u) => grades.includes(u.grade)).map((u) => u.price);
        return prices.length ? Math.min(...prices) : null;
      };
      return { m, replaced: low(["PIECES_REMPLACEES"]), original: low(["TRES_BON", "BON"]) };
    })
    .filter((r): r is { m: (typeof models)[number]; replaced: number; original: number } => r.replaced !== null && r.original !== null && r.replaced < r.original)
    .sort((a, b) => b.m.units.length - a.m.units.length)
    .slice(0, 5);
  if (!rows.length) return null;
  const max = Math.max(...rows.map((r) => r.original));

  return (
    <section className="my-10 rounded-4xl bg-white p-5 ring-1 ring-ink/7 sm:p-8">
      <h2 className="font-display text-2xl font-bold text-ink">{t.title}</h2>
      <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-sm bg-gold" /> {t.replaced}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-sm bg-ink" /> {t.original}
        </span>
      </p>
      <ul className="mt-6 space-y-5">
        {rows.map(({ m, replaced, original }) => (
          <li key={m.slug}>
            <div className="flex items-baseline justify-between gap-3">
              <Link href={`/telephones/${m.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
                {m.name}
              </Link>
              <span dir="ltr" className="readout text-sm font-bold text-signal">
                −{formatMAD(original - replaced)}
              </span>
            </div>
            <div dir="ltr" className="mt-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="h-3 rounded-full bg-gold" style={{ width: `${(replaced / max) * 75}%` }} />
                <span className="readout text-xs font-semibold text-neutral-700">{formatMAD(replaced)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 rounded-full bg-ink" style={{ width: `${(original / max) * 75}%` }} />
                <span className="readout text-xs font-semibold text-neutral-700">{formatMAD(original)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs text-neutral-500">{t.note}</p>
    </section>
  );
}
