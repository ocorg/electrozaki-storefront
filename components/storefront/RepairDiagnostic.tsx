"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { submitRepairRequest } from "@/app/(storefront)/reparation/actions";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { StepProgress } from "@/components/ui/StepProgress";
import { PROBLEMS, REPAIR_KINDS, type RepairKind } from "@/lib/repair-problems";

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Huawei", "Autre"];

const inputClass =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none";

// Four short steps, one decision each: what kind of help → which device →
// what's wrong (or, for a consultation, the question and a time) → contact.
export function RepairDiagnostic() {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<RepairKind | null>(null);
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problemAreas, setProblemAreas] = useState<string[]>([]);
  const [preferredSlot, setPreferredSlot] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const isConsult = kind === "CONSULTATION";

  function chooseKind(k: RepairKind) {
    setKind(k);
    setProblemAreas(k === "CONSULTATION" ? ["consultation"] : []);
    setStep(1);
  }

  function toggleProblem(key: string) {
    setProblemAreas((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kind) return;
    setError(null);
    setSubmitting(true);
    const result = await submitRepairRequest({
      kind,
      customerName,
      customerPhone,
      deviceBrand,
      deviceModel,
      problemAreas,
      preferredSlot: preferredSlot || undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(result.ref);
  }

  if (done) {
    return (
      <div className={cardClasses("mt-8 p-6 text-center")}>
        <CheckCircle2 size={28} className="mx-auto text-green-600" />
        <p className="mt-2 text-lg font-bold">Demande envoyée</p>
        <div className="mx-auto mt-4 max-w-xs rounded-xl border border-gold/50 bg-gold/5 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">Votre numéro de demande</p>
          <p className="mt-1 select-all font-mono text-2xl font-bold tracking-wider">{done}</p>
          <p className="mt-1 text-xs text-neutral-500">Notez-le : avec votre téléphone, il permet de suivre votre demande.</p>
        </div>
        <p className="mt-4 text-sm text-neutral-600">
          {isConsult
            ? "Nous vous contactons pour fixer l'heure de la consultation. "
            : "Nous vous répondons rapidement avec une estimation. "}
          Pour une réponse immédiate, écrivez-nous sur{" "}
          <a
            href="https://wa.me/212667654430"
            className="font-medium text-neutral-900 underline decoration-gold decoration-2 underline-offset-2"
          >
            WhatsApp
          </a>
          . Suivez votre demande, puis votre réparation, sur{" "}
          <Link
            href={`/reparation/suivi?ref=${encodeURIComponent(done)}`}
            className="font-medium underline decoration-gold decoration-2 underline-offset-2"
          >
            la page de suivi
          </Link>
          .
        </p>
      </div>
    );
  }

  // Step 0 — what kind of help.
  if (step === 0 || !kind) {
    return (
      <div className={cardClasses("mt-8 p-6")}>
        <StepProgress step={1} total={4} />
        <p className="mb-4 font-medium">De quoi avez-vous besoin ?</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {REPAIR_KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              onClick={() => chooseKind(k.kind)}
              className={`rounded-xl border bg-white p-4 text-left shadow-sm transition-colors hover:border-gold ${
                kind === k.kind ? "border-gold bg-gold/5" : "border-neutral-300"
              }`}
            >
              <k.icon size={22} className="text-gold" />
              <p className="mt-2 text-sm font-semibold">{k.label}</p>
              <p className="mt-1 text-xs text-neutral-500">{k.description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1 — which device (optional for a consultation).
  if (step === 1) {
    return (
      <div className={cardClasses("mt-8 p-6")}>
        <StepProgress step={2} total={4} />
        <p className="mb-4 font-medium">
          Quel est votre appareil ?{isConsult && <span className="text-sm font-normal text-neutral-500"> (facultatif)</span>}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {BRANDS.map((b) => (
            <Button
              key={b}
              type="button"
              variant={deviceBrand === b ? "accent" : "outline"}
              onClick={() => setDeviceBrand(b)}
              className={deviceBrand === b ? "" : "hover:bg-gold/5"}
            >
              {b}
            </Button>
          ))}
        </div>
        {deviceBrand && (
          <input
            type="text"
            placeholder="Modèle (ex : iPhone 12, Galaxy A32…)"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            maxLength={80}
            className={`mt-4 ${inputClass}`}
          />
        )}
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
            Retour
          </Button>
          <Button
            type="button"
            disabled={!isConsult && (!deviceBrand || !deviceModel.trim())}
            onClick={() => setStep(2)}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </div>
    );
  }

  // Step 2 — what's wrong, or the consultation's subject and a time.
  if (step === 2) {
    return (
      <div className={cardClasses("mt-8 p-6")}>
        <StepProgress step={3} total={4} />
        {isConsult ? (
          <div className="space-y-4">
            <p className="font-medium">Votre question</p>
            <textarea
              placeholder="Décrivez le problème ou la question (ex : mon téléphone chauffe, quel modèle choisir…)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
            />
            <input
              type="text"
              placeholder="Quand vous appeler ? (ex : demain après 18h)"
              value={preferredSlot}
              onChange={(e) => setPreferredSlot(e.target.value)}
              maxLength={120}
              className={inputClass}
            />
            <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              Consultation par WhatsApp (appel ou vidéo). Les conseils simples sont gratuits ; si le problème
              demande une intervention, nous vous annonçons le tarif avant de commencer.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 font-medium">Quel est le problème ? (plusieurs choix possibles)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PROBLEMS[kind].map((p) => {
                const isSelected = problemAreas.includes(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggleProblem(p.key)}
                    className={`min-h-11 rounded-xl border bg-white p-4 text-center shadow-sm transition-colors ${
                      isSelected ? "border-gold bg-gold/5" : "border-neutral-300 hover:border-gold"
                    }`}
                  >
                    <p.icon size={22} className={`mx-auto ${isSelected ? "text-gold" : "text-neutral-600"}`} />
                    <p className="mt-1.5 text-xs font-medium">{p.label}</p>
                  </button>
                );
              })}
            </div>
            {kind === "SOFTWARE" && problemAreas.includes("compte_config") && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                Pour un compte Google / Apple oublié, apportez une preuve que le téléphone vous appartient (facture ou
                boîte avec l&apos;IMEI). Nous ne débloquons jamais un appareil sans cette preuve.
              </p>
            )}
          </>
        )}
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
            Retour
          </Button>
          <Button
            type="button"
            disabled={isConsult ? notes.trim().length < 5 : problemAreas.length === 0}
            onClick={() => setStep(3)}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </div>
    );
  }

  // Step 3 — contact details.
  return (
    <form onSubmit={handleSubmit} className={cardClasses("mt-8 space-y-4 p-6")}>
      <StepProgress step={4} total={4} />
      <p className="mb-2 font-medium">Vos coordonnées</p>
      <input
        type="text"
        required
        placeholder="Nom complet"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        maxLength={120}
        className={inputClass}
      />
      <input
        type="tel"
        required
        placeholder="Numéro de téléphone (ex : 06XXXXXXXX)"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className={inputClass}
      />
      {!isConsult && (
        <textarea
          placeholder="Détail supplémentaire (facultatif)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
          Retour
        </Button>
        <Button type="submit" variant="accent" disabled={submitting} className="flex-1">
          {submitting ? "Envoi…" : isConsult ? "Demander la consultation" : "Demander une évaluation"}
        </Button>
      </div>
    </form>
  );
}
