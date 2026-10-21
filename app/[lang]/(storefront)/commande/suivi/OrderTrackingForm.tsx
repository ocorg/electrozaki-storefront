"use client";

import { useState, type FormEvent } from "react";
import { Check, CheckCircle2, Copy, ExternalLink, MessageCircle, PackageCheck, Search, Truck, Undo2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatMAD } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import { useLocale, useT } from "@/components/i18n/I18nProvider";
import { LOCALE_META } from "@/lib/i18n/config";
import { translateError } from "@/lib/i18n/labels";
import type { TrackedOrder } from "@/lib/order-tracking";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { lookupOrder } from "./actions";

// Ameex's own tracking page, the one the shop already sends customers to
// with their parcel number.
const AMEEX_TRACKING = "https://ameex.ma/fr/livraison";

const inputClass =
  "min-h-12 w-full rounded-2xl border border-ink/15 bg-white px-4 text-[15px] focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

export function OrderTrackingForm({ initialRef }: { initialRef: string }) {
  const t = useT();
  const o = t.orderTracking;
  const locale = useLocale();
  const [ref, setRef] = useState(initialRef);
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  // The phone the order was found with (the review form proves ownership with it).
  const [foundWith, setFoundWith] = useState("");

  const day = (iso: string) =>
    new Date(iso).toLocaleDateString(`${LOCALE_META[locale].intl}-u-nu-latn`, { timeZone: "Etc/GMT", weekday: "long", day: "numeric", month: "long" });

  async function search(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await lookupOrder(ref, phone).catch(() => null);
    setBusy(false);
    if (!r) setError(t.errors.network);
    else if (r.ok) {
      setOrder(r.order);
      setFoundWith(phone);
    }
    else {
      setOrder(null);
      setError(translateError(t, r.error));
    }
  }

  async function copyNumber(n: string) {
    try {
      await navigator.clipboard.writeText(n);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // the number stays visible and selectable
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={search} className="space-y-3 rounded-3xl border border-ink/8 bg-white p-5 sm:p-6">
        <input
          type="text"
          required
          placeholder={o.refPlaceholder}
          aria-label={o.refPlaceholder}
          dir="ltr"
          value={ref}
          maxLength={9}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          className={`${inputClass} font-mono tracking-widest`}
          autoComplete="off"
        />
        <input
          type="tel"
          required
          placeholder={o.phonePlaceholder}
          aria-label={o.phonePlaceholder}
          dir="ltr"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={`${inputClass} rtl:text-end`}
          autoComplete="tel"
        />
        <Button type="submit" variant="accent" size="lg" loading={busy} className="w-full">
          {!busy && <Search size={17} aria-hidden />} {busy ? o.searching : o.submit}
        </Button>
        <p className="text-xs text-neutral-500">{o.whereRef}</p>
        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </form>

      {order && (
        <section aria-live="polite" className="space-y-5 rounded-3xl border border-ink/8 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p dir="ltr" className="font-mono text-lg font-bold tracking-widest text-ink">
              #{order.ref}
            </p>
            <p className="text-sm text-neutral-500">
              {o.placed} {day(order.createdAt)}
            </p>
          </div>

          {order.state === "cancelled" ? (
            <p className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-700">
              <XCircle size={18} aria-hidden /> {o.cancelled}
            </p>
          ) : (
            <>
              {order.state === "returned" && (
                <p className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  <Undo2 size={18} aria-hidden /> {o.returned}
                </p>
              )}
              {order.state === "delivered" && (
                <p className="flex items-center gap-2 rounded-2xl bg-signal/10 px-4 py-3 text-sm font-semibold text-signal">
                  <PackageCheck size={18} aria-hidden /> {o.delivered}
                </p>
              )}
              <ol className="relative space-y-4 ps-1">
                {order.steps.map((key, i) => {
                  const done = i < order.current;
                  const now = i === order.current && order.state === "active";
                  return (
                    <li key={key} className="flex gap-3">
                      <span
                        aria-hidden
                        className={`mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full ${
                          done ? "bg-signal text-white" : now ? "bg-gold text-ink ring-4 ring-gold/25" : "bg-ink/6 text-neutral-400"
                        }`}
                      >
                        {done ? <Check size={15} /> : key === "shipped" ? <Truck size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
                      </span>
                      <div className="min-w-0">
                        <p className={`font-semibold ${now ? "text-ink" : done ? "text-neutral-700" : "text-neutral-400"}`}>{o.steps[key]}</p>
                        {now && <p className="text-sm text-neutral-600">{o.hints[key]}</p>}
                        {key === "advance" && order.advance && (done || now) && (
                          <p className={`text-sm ${order.advance === "REJECTED" ? "text-red-700" : "text-neutral-600"}`}>{o.advance[order.advance]}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          {order.trackingNumber && order.state !== "cancelled" && (
            <div className="rounded-2xl bg-paper-2 p-4">
              <p className="text-sm font-semibold text-neutral-700">{o.tracking}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span dir="ltr" className="select-all rounded-xl bg-white px-3 py-2 font-mono text-base font-bold tracking-wider text-ink ring-1 ring-ink/10">
                  {order.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() => copyNumber(order.trackingNumber!)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink ring-1 ring-ink/10 hover:ring-ink/30"
                >
                  {copied ? <CheckCircle2 size={15} aria-hidden /> : <Copy size={15} aria-hidden />} {copied ? o.copied : o.copy}
                </button>
              </div>
              <a
                href={AMEEX_TRACKING}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white"
              >
                <ExternalLink size={16} aria-hidden /> {o.followAmeex}
              </a>
              <p className="mt-2 text-xs text-neutral-500">{o.ameexHint}</p>
            </div>
          )}

          <dl className="space-y-2 border-t border-ink/8 pt-4 text-sm">
            {order.deliveryCity && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600">{o.city}</dt>
                <dd className="font-semibold text-ink">{order.deliveryCity}</dd>
              </div>
            )}
            {order.deliveryEstimate && order.state === "active" && (
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600">{o.estimate}</dt>
                <dd className="font-semibold text-ink">{day(order.deliveryEstimate)}</dd>
              </div>
            )}
            <div>
              <dt className="text-neutral-600">{o.items}</dt>
              <dd>
                <ul className="mt-1 space-y-0.5">
                  {order.items.map((it, i) => (
                    <li key={i} className="font-medium text-ink">
                      {it.quantity > 1 ? `${it.quantity} × ` : ""}
                      {it.name}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-ink/8 pt-2">
              <dt className="font-bold text-ink">{o.total}</dt>
              <dd className="readout font-bold text-ink">{formatMAD(order.total)}</dd>
            </div>
          </dl>

          {order.items.some((it) => it.reviewable) && (
            <div className="space-y-3 border-t border-ink/8 pt-5">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">{t.reviews.formTitle}</h2>
                <p className="mt-1 text-sm text-neutral-600">{t.reviews.formIntro}</p>
              </div>
              {order.items
                .filter((it) => it.reviewable)
                .map((it) => (
                  <ReviewForm key={`${order.ref}-${it.id}`} orderRef={order.ref} phone={foundWith} item={it} defaultName={order.reviewName} />
                ))}
            </div>
          )}

          <a
            href={whatsappLink(`${o.title} #${order.ref}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-whatsapp/60 bg-whatsapp/10 text-sm font-semibold text-ink"
          >
            <MessageCircle size={17} aria-hidden /> {o.question}
          </a>
        </section>
      )}
    </div>
  );
}
