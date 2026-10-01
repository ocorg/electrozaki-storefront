"use client";

import { useState, type FormEvent } from "react";
import Link from "@/components/i18n/Link";
import { CheckCircle2 } from "lucide-react";
import { submitRepairRequest } from "@/app/[lang]/(storefront)/reparation/actions";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { StepProgress } from "@/components/ui/StepProgress";
import { PROBLEMS, REPAIR_KINDS, type RepairKind } from "@/lib/repair-problems";
import { WHATSAPP_URL } from "@/lib/site";
import { useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";

// "Autre" is the value the ERP receives; only its label is translated.
const BRANDS = ["Apple", "Samsung", "Xiaomi", "Huawei", "Autre"];

const inputClass =
  "min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30";

// Four short steps, one decision each: what kind of help → which device →
// what's wrong (or, for a consultation, the question and a time) → contact.
export function RepairDiagnostic() {
  const t = useT();
  const d = t.diagnostic;
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
      setError(translateError(t, result.error));
      return;
    }
    setDone(result.ref);
  }

  if (done) {
    return (
      <div className={cardClasses("p-6 text-center")}>
        <CheckCircle2 size={28} className="mx-auto text-green-600" />
        <p className="mt-2 text-lg font-bold">{d.sent}</p>
        <div className="mx-auto mt-4 max-w-xs rounded-xl border border-gold/50 bg-gold/5 p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">{d.yourRef}</p>
          <p dir="ltr" className="mt-1 select-all font-mono text-2xl font-bold tracking-wider">{done}</p>
          <p className="mt-1 text-xs text-neutral-500">{d.noteIt}</p>
        </div>
        <p className="mt-4 text-sm text-neutral-600">
          {isConsult ? d.consultNext : d.repairNext} {d.immediateBefore}{" "}
          <a
            href={WHATSAPP_URL}
            className="font-medium text-neutral-900 underline decoration-gold decoration-2 underline-offset-2"
          >
            WhatsApp
          </a>
          {d.trackBefore}{" "}
          <Link
            href={`/reparation/suivi?ref=${encodeURIComponent(done)}`}
            className="font-medium underline decoration-gold decoration-2 underline-offset-2"
          >
            {d.trackLink}
          </Link>
          .
        </p>
      </div>
    );
  }

  // Step 0 — what kind of help.
  if (step === 0 || !kind) {
    return (
      <div className={cardClasses("p-6")}>
        <StepProgress step={1} total={4} />
        <p className="mb-4 font-medium">{d.needQ}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {REPAIR_KINDS.map((k) => (
            <button
              key={k.kind}
              type="button"
              onClick={() => chooseKind(k.kind)}
              className={`rounded-xl border bg-white p-4 text-start shadow-sm transition-colors hover:border-gold ${
                kind === k.kind ? "border-gold bg-gold/5" : "border-neutral-300"
              }`}
            >
              <k.icon size={22} className="text-gold-deep" />
              <p className="mt-2 text-sm font-semibold">{t.repairKinds[k.kind].label}</p>
              <p className="mt-1 text-xs text-neutral-500">{t.repairKinds[k.kind].description}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Step 1 — which device (optional for a consultation).
  if (step === 1) {
    return (
      <div className={cardClasses("p-6")}>
        <StepProgress step={2} total={4} />
        <p className="mb-4 font-medium">
          {d.deviceQ}{isConsult && <span className="text-sm font-normal text-neutral-500"> {d.optional}</span>}
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
              {b === "Autre" ? d.otherBrand : b}
            </Button>
          ))}
        </div>
        {deviceBrand && (
          <input
            type="text"
            placeholder={d.modelPlaceholder}
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            maxLength={80}
            className={`mt-4 ${inputClass}`}
          />
        )}
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
            {d.back}
          </Button>
          <Button
            type="button"
            disabled={!isConsult && (!deviceBrand || !deviceModel.trim())}
            onClick={() => setStep(2)}
            className="flex-1"
          >
            {d.next}
          </Button>
        </div>
      </div>
    );
  }

  // Step 2 — what's wrong, or the consultation's subject and a time.
  if (step === 2) {
    return (
      <div className={cardClasses("p-6")}>
        <StepProgress step={3} total={4} />
        {isConsult ? (
          <div className="space-y-4">
            <p className="font-medium">{d.yourQuestion}</p>
            <textarea
              placeholder={d.questionPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <input
              type="text"
              placeholder={d.slotPlaceholder}
              value={preferredSlot}
              onChange={(e) => setPreferredSlot(e.target.value)}
              maxLength={120}
              className={inputClass}
            />
            <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
              {d.consultNote}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 font-medium">{d.problemQ}</p>
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
                    <p.icon size={22} className={`mx-auto ${isSelected ? "text-gold-deep" : "text-neutral-600"}`} />
                    <p className="mt-1.5 text-xs font-medium">{t.repairProblems[p.key] ?? p.key}</p>
                  </button>
                );
              })}
            </div>
            {kind === "SOFTWARE" && problemAreas.includes("compte_config") && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {d.accountNote}
              </p>
            )}
          </>
        )}
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
            {d.back}
          </Button>
          <Button
            type="button"
            disabled={isConsult ? notes.trim().length < 5 : problemAreas.length === 0}
            onClick={() => setStep(3)}
            className="flex-1"
          >
            {d.next}
          </Button>
        </div>
      </div>
    );
  }

  // Step 3 — contact details.
  return (
    <form onSubmit={handleSubmit} className={cardClasses("space-y-4 p-6")}>
      <StepProgress step={4} total={4} />
      <p className="mb-2 font-medium">{d.contactQ}</p>
      <input
        type="text"
        required
        placeholder={d.fullName}
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        maxLength={120}
        className={inputClass}
      />
      <input
        type="tel"
        required
        placeholder={d.phone}
        dir="ltr"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className={inputClass}
      />
      {!isConsult && (
        <textarea
          placeholder={d.extra}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
          {d.back}
        </Button>
        <Button type="submit" variant="accent" disabled={submitting} className="flex-1">
          {submitting ? d.sending : isConsult ? d.askConsult : d.askEstimate}
        </Button>
      </div>
    </form>
  );
}
