"use client";

import { useState, type FormEvent } from "react";
import { Check, CheckCircle2, Circle, Search, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { Button, AnchorButton } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { formatMAD } from "@/lib/format";
import type { TrackedRepair } from "@/lib/repair-tracking";
import { lookupRepair, answerQuote } from "./actions";
import { WHATSAPP_URL } from "@/lib/site";
import { useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";

const inputClass =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

// Steps shown to the customer, in order (ERP status codes; the plain words
// are in the dictionary). Website requests start one step earlier, before
// the device is dropped off ("demande_recue").
const STEP_KEYS = ["en_attente", "devis_envoye", "en_cours", "pret", "recupere"] as const;

export function TrackingForm({ initialRef }: { initialRef: string }) {
  const t = useT();
  const tf = t.trackingForm;
  const [ref, setRef] = useState(initialRef);
  const [phone, setPhone] = useState("");
  const [repair, setRepair] = useState<TrackedRepair | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function search(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await lookupRepair(ref, phone);
    setBusy(false);
    if (r.ok) setRepair(r.repair);
    else {
      setRepair(null);
      setError(translateError(t, r.error));
    }
  }

  async function answer(accept: boolean) {
    if (!repair) return;
    const text = accept ? tf.confirmAccept(formatMAD(repair.quoteAmount ?? 0)) : tf.confirmRefuse;
    if (!window.confirm(text)) return;
    setBusy(true);
    const r = await answerQuote(repair.ref, phone, accept);
    setBusy(false);
    if (r.ok) setRepair(r.repair);
    else setError(translateError(t, r.error));
  }

  const labels = repair?.kind === "CONSULTATION" ? tf.consultSteps : tf.repairSteps;
  const base = STEP_KEYS.map((key) => ({ key: key as string, label: labels[key] }));
  const steps = repair?.requestRef ? [{ key: "demande_recue", label: tf.requestStep }, ...base] : base;
  // The quote step only appears when there was a quote.
  const shown = steps.filter((s) => s.key !== "devis_envoye" || repair?.quoteAmount !== null);
  const current = shown.findIndex((s) => s.key === repair?.status);

  return (
    <div className="space-y-6">
      <form onSubmit={search} className={cardClasses("space-y-3 p-6")}>
        <input
          type="text"
          required
          placeholder={tf.refPlaceholder}
          dir="ltr"
          value={ref}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          className={`${inputClass} font-mono`}
          autoComplete="off"
        />
        <input
          type="tel"
          required
          placeholder={tf.phonePlaceholder}
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        <Button type="submit" disabled={busy} className="w-full">
          <Search size={16} /> {busy ? tf.searching : tf.submit}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {repair && (
        <div className={cardClasses("space-y-5 p-6")}>
          <div>
            <p dir="ltr" className="font-mono text-sm text-neutral-500 rtl:text-end">
              {repair.requestRef && repair.requestRef !== repair.ref ? `${repair.requestRef} → ${repair.ref}` : repair.ref}
            </p>
            <p className="text-lg font-semibold">{repair.device}</p>
          </div>

          {repair.cancelled ? (
            <p className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
              <XCircle size={16} /> {tf.cancelled}
            </p>
          ) : (
            <ol className="space-y-3">
              {shown.map((s, i) => {
                const done = i < current;
                const now = i === current;
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    {done ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : now ? (
                      <Circle size={20} className="fill-gold text-gold-deep" />
                    ) : (
                      <Circle size={20} className="text-neutral-300" />
                    )}
                    <span className={now ? "font-semibold" : done ? "text-neutral-600" : "text-neutral-500"}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {!repair.cancelled && repair.status === "devis_envoye" && repair.quoteAmount !== null && (
            <div className="space-y-3 rounded-xl border border-gold/50 bg-gold/5 p-4">
              <p className="text-sm">
                {tf.quote} <b className="text-lg">{formatMAD(repair.quoteAmount)}</b>
              </p>
              {repair.quoteDecision ? (
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Check size={16} className="text-green-600" />
                  {repair.quoteDecision === "ACCEPTED"
                    ? tf.accepted
                    : tf.refused}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="accent" disabled={busy} onClick={() => answer(true)}>
                    <ThumbsUp size={16} /> {tf.accept}
                  </Button>
                  <Button type="button" variant="outline" disabled={busy} onClick={() => answer(false)}>
                    <ThumbsDown size={16} /> {tf.refuse}
                  </Button>
                </div>
              )}
            </div>
          )}

          {repair.status === "pret" && !repair.cancelled && repair.kind !== "CONSULTATION" && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              {tf.ready}
            </p>
          )}

          <AnchorButton href={WHATSAPP_URL} variant="outline" className="w-full">
            {tf.question}
          </AnchorButton>
        </div>
      )}
    </div>
  );
}
