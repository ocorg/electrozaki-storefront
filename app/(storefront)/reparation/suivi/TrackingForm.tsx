"use client";

import { useState, type FormEvent } from "react";
import { Check, CheckCircle2, Circle, Search, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { Button, AnchorButton } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { formatMAD } from "@/lib/format";
import type { TrackedRepair } from "@/lib/repair-tracking";
import { lookupRepair, answerQuote } from "./actions";

const inputClass =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none";

// Steps shown to the customer (ERP status codes → plain words).
const REPAIR_STEPS = [
  { key: "en_attente", label: "Reçu en boutique" },
  { key: "devis_envoye", label: "Devis à valider" },
  { key: "en_cours", label: "Réparation en cours" },
  { key: "pret", label: "Prêt à récupérer" },
  { key: "recupere", label: "Récupéré" },
];
const CONSULT_STEPS = [
  { key: "en_attente", label: "Demande reçue" },
  { key: "devis_envoye", label: "Tarif à valider" },
  { key: "en_cours", label: "Consultation en cours" },
  { key: "pret", label: "Terminée" },
  { key: "recupere", label: "Clôturée" },
];

// Website requests start one step earlier, before the device is dropped off.
const REQUEST_STEP = { key: "demande_recue", label: "Demande reçue — nous vous contactons" };

export function TrackingForm({ initialRef }: { initialRef: string }) {
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
      setError(r.error);
    }
  }

  async function answer(accept: boolean) {
    if (!repair) return;
    const text = accept
      ? `Confirmer : vous acceptez le devis de ${formatMAD(repair.quoteAmount ?? 0)} ?`
      : "Confirmer : vous refusez le devis ? Votre appareil vous sera rendu sans réparation.";
    if (!window.confirm(text)) return;
    setBusy(true);
    const r = await answerQuote(repair.ref, phone, accept);
    setBusy(false);
    if (r.ok) setRepair(r.repair);
    else setError(r.error);
  }

  const base = repair?.kind === "CONSULTATION" ? CONSULT_STEPS : REPAIR_STEPS;
  const steps = repair?.requestRef ? [REQUEST_STEP, ...base] : base;
  // The quote step only appears when there was a quote.
  const shown = steps.filter((s) => s.key !== "devis_envoye" || repair?.quoteAmount !== null);
  const current = shown.findIndex((s) => s.key === repair?.status);

  return (
    <div className="space-y-6">
      <form onSubmit={search} className={cardClasses("space-y-3 p-6")}>
        <input
          type="text"
          required
          placeholder="N° de demande ou de réparation (DEM-… ou REP-…)"
          value={ref}
          onChange={(e) => setRef(e.target.value.toUpperCase())}
          className={`${inputClass} font-mono`}
          autoComplete="off"
        />
        <input
          type="tel"
          required
          placeholder="Votre numéro de téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
        />
        <Button type="submit" disabled={busy} className="w-full">
          <Search size={16} /> {busy ? "Recherche…" : "Suivre ma réparation"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      {repair && (
        <div className={cardClasses("space-y-5 p-6")}>
          <div>
            <p className="font-mono text-sm text-neutral-500">
              {repair.requestRef && repair.requestRef !== repair.ref ? `${repair.requestRef} → ${repair.ref}` : repair.ref}
            </p>
            <p className="text-lg font-semibold">{repair.device}</p>
          </div>

          {repair.cancelled ? (
            <p className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-700">
              <XCircle size={16} /> Cette demande a été annulée. Contactez-nous pour toute question.
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
                      <Circle size={20} className="fill-gold text-gold" />
                    ) : (
                      <Circle size={20} className="text-neutral-300" />
                    )}
                    <span className={now ? "font-semibold" : done ? "text-neutral-600" : "text-neutral-400"}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}

          {!repair.cancelled && repair.status === "devis_envoye" && repair.quoteAmount !== null && (
            <div className="space-y-3 rounded-xl border border-gold/50 bg-gold/5 p-4">
              <p className="text-sm">
                Devis proposé : <b className="text-lg">{formatMAD(repair.quoteAmount)}</b>
              </p>
              {repair.quoteDecision ? (
                <p className="flex items-center gap-2 text-sm font-medium">
                  <Check size={16} className="text-green-600" />
                  {repair.quoteDecision === "ACCEPTED"
                    ? "Merci, vous avez accepté le devis — nous lançons la réparation."
                    : "Vous avez refusé le devis — votre appareil vous sera rendu."}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="accent" disabled={busy} onClick={() => answer(true)}>
                    <ThumbsUp size={16} /> J&apos;accepte
                  </Button>
                  <Button type="button" variant="outline" disabled={busy} onClick={() => answer(false)}>
                    <ThumbsDown size={16} /> Je refuse
                  </Button>
                </div>
              )}
            </div>
          )}

          {repair.status === "pret" && !repair.cancelled && repair.kind !== "CONSULTATION" && (
            <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              Votre appareil est prêt : passez le récupérer à la boutique Electro Zaki (Meknès) avec votre bon de dépôt.
            </p>
          )}

          <AnchorButton href="https://wa.me/212667654430" variant="outline" className="w-full">
            Une question ? Écrivez-nous sur WhatsApp
          </AnchorButton>
        </div>
      )}
    </div>
  );
}
