"use client";

import { useState, type FormEvent } from "react";
import { submitRepairRequest } from "@/app/(storefront)/reparation/actions";

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Huawei", "Autre"];

const PROBLEM_AREAS = [
  { key: "ecran", icon: "📱", label: "Écran" },
  { key: "batterie", icon: "🔋", label: "Batterie" },
  { key: "camera", icon: "📷", label: "Appareil photo" },
  { key: "connecteur", icon: "🔌", label: "Port de charge" },
  { key: "son", icon: "🔊", label: "Son / Micro" },
  { key: "reseau", icon: "🌐", label: "Désimlockage réseau" },
];

export function RepairDiagnostic() {
  const [step, setStep] = useState(0);
  const [deviceBrand, setDeviceBrand] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [problemAreas, setProblemAreas] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function toggleProblem(key: string) {
    setProblemAreas((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await submitRepairRequest({
      customerName,
      customerPhone,
      deviceBrand,
      deviceModel,
      problemAreas,
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-8 rounded-lg border border-black/10 p-6 text-center">
        <p className="text-lg font-bold">Demande envoyée ✓</p>
        <p className="mt-2 text-sm text-neutral-600">
          Nous vous répondrons rapidement avec une estimation. Pour une réponse immédiate,
          contactez-nous sur{" "}
          <a
            href="https://wa.me/212667654430"
            className="font-medium text-neutral-900 underline decoration-[#c8922a] decoration-2 underline-offset-2"
          >
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  // Step 0 — one action: identify the device.
  if (step === 0) {
    return (
      <div className="mt-8 rounded-lg border border-black/10 p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Étape 1 / 3
        </p>
        <p className="mb-4 font-medium">Quel est votre appareil ?</p>

        <div className="grid gap-2 sm:grid-cols-3">
          {BRANDS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setDeviceBrand(b)}
              className={`min-h-11 rounded border bg-white px-4 py-3 text-sm shadow-sm transition-colors ${
                deviceBrand === b
                  ? "border-[#c8922a] bg-[#c8922a]/5"
                  : "border-neutral-300 hover:border-[#c8922a]"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {deviceBrand && (
          <input
            type="text"
            placeholder="Modèle (ex: iPhone 12, Galaxy A32...)"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            className="mt-4 min-h-11 w-full rounded border border-black/20 px-3"
          />
        )}

        <button
          type="button"
          disabled={!deviceBrand || !deviceModel.trim()}
          onClick={() => setStep(1)}
          className="mt-4 min-h-11 w-full rounded bg-[#121212] px-4 text-sm font-semibold text-white disabled:opacity-40"
        >
          Continuer
        </button>
      </div>
    );
  }

  // Step 1 — one action: identify the problem(s), no text field required.
  if (step === 1) {
    return (
      <div className="mt-8 rounded-lg border border-black/10 p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Étape 2 / 3
        </p>
        <p className="mb-4 font-medium">Quel est le problème ? (plusieurs choix possibles)</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROBLEM_AREAS.map((p) => {
            const isSelected = problemAreas.includes(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggleProblem(p.key)}
                className={`min-h-11 rounded-lg border bg-white p-4 text-center shadow-sm transition-colors ${
                  isSelected
                    ? "border-[#c8922a] bg-[#c8922a]/5"
                    : "border-neutral-300 hover:border-[#c8922a]"
                }`}
              >
                <div className="text-2xl">{p.icon}</div>
                <p className="mt-1 text-xs font-medium">{p.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setStep(0)}
            className="min-h-11 flex-1 rounded border border-black/20 px-4 text-sm"
          >
            Retour
          </button>
          <button
            type="button"
            disabled={problemAreas.length === 0}
            onClick={() => setStep(2)}
            className="min-h-11 flex-1 rounded bg-[#121212] px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            Continuer
          </button>
        </div>
      </div>
    );
  }

  // Step 2 — one action: leave contact info and submit.
  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-4 rounded-lg border border-black/10 p-6"
    >
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Étape 3 / 3
      </p>
      <p className="mb-2 font-medium">Vos coordonnées</p>

      <input
        type="text"
        required
        placeholder="Nom complet"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="min-h-11 w-full rounded border border-black/20 px-3"
      />
      <input
        type="tel"
        required
        placeholder="Numéro de téléphone (ex: 06XXXXXXXX)"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className="min-h-11 w-full rounded border border-black/20 px-3"
      />
      <textarea
        placeholder="Détail supplémentaire (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full rounded border border-black/20 px-3 py-2"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="min-h-11 flex-1 rounded border border-black/20 px-4 text-sm"
        >
          Retour
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 flex-1 rounded bg-[#c8922a] px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "Envoi..." : "Demander une évaluation"}
        </button>
      </div>
    </form>
  );
}
