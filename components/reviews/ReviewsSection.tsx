import { BadgeCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LOCALE_META, type Locale } from "@/lib/i18n/config";
import type { ReviewSummary } from "@/lib/reviews";
import { Stars } from "./Stars";

// Customer reviews of a phone model (or a product), on its pages: the
// average, how the stars split, and the latest reviews. Rendered only when
// there is at least one review.
export function ReviewsSection({
  summary,
  name,
  t,
  locale,
  className = "",
}: {
  summary: ReviewSummary;
  name: string;
  t: Dictionary;
  locale: Locale;
  className?: string;
}) {
  const r = t.reviews;
  const avg = summary.average.toLocaleString(`${LOCALE_META[locale].intl}-u-nu-latn`, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const day = (iso: string) =>
    new Date(iso).toLocaleDateString(`${LOCALE_META[locale].intl}-u-nu-latn`, { day: "numeric", month: "long", year: "numeric" });
  const max = Math.max(...summary.histogram);

  return (
    <section aria-labelledby="avis" className={className}>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{r.eyebrow}</p>
      <h2 id="avis" className="font-display mt-3 text-[2rem] font-bold leading-[1.05] text-ink sm:text-[2.4rem]">
        {r.title(name)}
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10">
        <div className="h-fit rounded-3xl bg-white p-6 ring-1 ring-ink/7">
          <div className="flex items-end gap-3">
            <p className="readout text-5xl font-bold text-ink">{avg}</p>
            <p className="pb-1.5 text-sm text-neutral-600">{r.outOf}</p>
          </div>
          <Stars value={summary.average} size={20} label={r.rating(avg)} className="mt-2" />
          <p className="mt-1 text-sm font-semibold text-neutral-700">{r.count(summary.count)}</p>
          <ul className="mt-5 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const n = summary.histogram[star - 1];
              return (
                <li key={star} className="flex items-center gap-2 text-sm">
                  <span className="readout w-3 text-neutral-600">{star}</span>
                  <span className="sr-only">{r.star(star)}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-ink/7" aria-hidden>
                    <span className="block h-full rounded-full bg-gold" style={{ width: max ? `${(n / max) * 100}%` : 0 }} />
                  </span>
                  <span className="readout w-6 text-end text-neutral-600">{n}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-neutral-600">{r.about}</p>
        </div>

        <ul className="space-y-3">
          {summary.latest.map((review) => (
            <li key={review.id} className="rounded-3xl bg-white p-5 ring-1 ring-ink/7 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <Stars value={review.rating} label={r.star(review.rating)} />
                <time dateTime={review.createdAt} className="text-sm text-neutral-500">
                  {day(review.createdAt)}
                </time>
              </div>
              {review.comment && (
                // Shown in the language it was written in.
                <p dir="auto" className="mt-3 whitespace-pre-line leading-relaxed text-neutral-800">
                  {review.comment}
                </p>
              )}
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <bdi className="font-semibold text-ink">{review.authorName}</bdi>
                <span className="inline-flex items-center gap-1 text-signal">
                  <BadgeCheck size={15} aria-hidden /> {r.verified}
                </span>
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {r.bought} <span dir="ltr">{review.productName}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
