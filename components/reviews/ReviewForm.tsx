"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Pencil, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocale, useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";
import type { TrackedItem } from "@/lib/order-tracking";
import { submitReview } from "@/app/[lang]/(storefront)/commande/suivi/actions";
import { Stars } from "./Stars";

const COMMENT_MAX = 1000;
const NAME_MAX = 40;

const fieldClass =
  "w-full rounded-2xl border border-ink/15 bg-white px-4 text-[15px] focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

// One order line's review, on the tracking page of a delivered order. The
// customer already proved the order is theirs (ref + phone); the server
// checks it again when the review is sent.
export function ReviewForm({
  orderRef,
  phone,
  item,
  defaultName,
}: {
  orderRef: string;
  phone: string;
  item: TrackedItem;
  defaultName: string;
}) {
  const t = useT();
  const r = t.reviews;
  const locale = useLocale();
  const [saved, setSaved] = useState(item.review);
  const [editing, setEditing] = useState(!item.review);
  const [rating, setRating] = useState(item.review?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(item.review?.comment ?? "");
  const [name, setName] = useState(item.review?.authorName ?? defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!rating) {
      setError(t.errors.reviewPickStars);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await submitReview({ ref: orderRef, phone, itemId: item.id, rating, comment, name, locale }).catch(() => null);
    setBusy(false);
    if (!res) setError(t.errors.network);
    else if (!res.ok) setError(translateError(t, res.error));
    else {
      setSaved({ rating, comment: comment.trim() || null, authorName: res.authorName });
      setName(res.authorName);
      setEditing(false);
      setJustSaved(true);
    }
  }

  const shown = hover || rating;

  if (!editing && saved) {
    return (
      <div className="rounded-2xl bg-paper-2 p-4">
        <p className="font-semibold text-ink">{item.name}</p>
        {justSaved && (
          <p role="status" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-signal">
            <CheckCircle2 size={16} aria-hidden /> {r.thanks}
          </p>
        )}
        <Stars value={saved.rating} size={18} label={r.star(saved.rating)} className="mt-2" />
        {saved.comment && (
          <p dir="auto" className="mt-2 whitespace-pre-line text-sm text-neutral-700">
            {saved.comment}
          </p>
        )}
        <p className="mt-2 text-sm text-neutral-600"><bdi>{saved.authorName}</bdi></p>
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setJustSaved(false);
          }}
          className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-ink/30"
        >
          <Pencil size={14} aria-hidden /> {r.edit}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4 rounded-2xl bg-paper-2 p-4">
      <p className="font-semibold text-ink">{item.name}</p>

      <fieldset>
        <legend className="text-sm font-semibold text-neutral-700">{r.yourRating}</legend>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1" onMouseLeave={() => setHover(0)}>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                onMouseEnter={() => setHover(n)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full has-focus-visible:ring-2 has-focus-visible:ring-gold-deep"
              >
                <input
                  type="radio"
                  name={`rating-${item.id}`}
                  value={n}
                  checked={rating === n}
                  onChange={() => setRating(n)}
                  className="sr-only"
                />
                <span className="sr-only">{r.star(n)}</span>
                <Star
                  size={30}
                  aria-hidden
                  strokeWidth={1.5}
                  className={n <= shown ? "text-gold" : "text-neutral-300"}
                  fill={n <= shown ? "currentColor" : "none"}
                />
              </label>
            ))}
          </div>
          {shown > 0 && <span className="text-sm font-semibold text-neutral-700">{r.starWords[shown - 1]}</span>}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-700">{r.commentLabel}</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
          placeholder={r.commentPlaceholder}
          rows={4}
          dir="auto"
          className={`${fieldClass} mt-1.5 py-3`}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-neutral-700">{r.nameLabel}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
          dir="auto"
          autoComplete="given-name"
          className={`${fieldClass} mt-1.5 min-h-12`}
        />
        <span className="mt-1 block text-xs text-neutral-500">{r.nameHint}</span>
      </label>

      {error && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="accent" loading={busy} className="flex-1">
          {busy ? r.saving : saved ? r.update : r.submit}
        </Button>
        {saved && (
          <Button type="button" variant="outline" onClick={() => setEditing(false)}>
            {r.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}
