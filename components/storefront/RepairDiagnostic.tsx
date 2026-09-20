"use client";

import { useState, type FormEvent } from "react";
import {
  BatteryCharging,
  Camera,
  CheckCircle2,
  Globe,
  Plug,
  Smartphone,
  Volume2,
} from "lucide-react";
import { submitRepairRequest } from "@/app/(storefront)/reparation/actions";
import { Button } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { StepProgress } from "@/components/ui/StepProgress";

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Huawei", "Autre"];

const PROBLEM_AREAS = [
  { key: "ecran", icon: Smartphone, label: "Écran" },
  { key: "batterie", icon: BatteryCharging, label: "Batterie" },
  { key: "camera", icon: Camera, label: "Appareil photo" },
  { key: "connecteur", icon: Plug, label: "Port de charge" },
  { key: "son", icon: Volume2, label: "Son / Micro" },
  { key: "reseau", icon: Globe, label: "Désimlockage réseau" },
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
      <div className={cardClasses("mt-8 p-6 text-center")}>
        <CheckCircle2 size={28} className="mx-auto text-green-600" />
        <p className="mt-2 text-lg font-bold">Demande envoyée</p>
        <p className="mt-2 text-sm text-neutral-600">
          Nous vous répondrons rapidement avec une estimation. Pour une réponse immédiate,
          contactez-nous sur{" "}
          <a
            href="https://wa.me/212667654430"
            className="font-medium text-neutral-900 underline decoration-gold decoration-2 underline-offset-2"
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
      <div className={cardClasses("mt-8 p-6")}>
        <StepProgress step={1} total={3} />
        <p className="mb-4 font-medium">Quel est votre appareil ?</p>

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
            placeholder="Modèle (ex: iPhone 12, Galaxy A32...)"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            className="mt-4 min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
          />
        )}

        <Button
          type="button"
          disabled={!deviceBrand || !deviceModel.trim()}
          onClick={() => setStep(1)}
          className="mt-4 w-full"
        >
          Continuer
        </Button>
      </div>
    );
  }

  // Step 1 — one action: identify the problem(s), no text field required.
  if (step === 1) {
    return (
      <div className={cardClasses("mt-8 p-6")}>
        <StepProgress step={2} total={3} />
        <p className="mb-4 font-medium">Quel est le problème ? (plusieurs choix possibles)</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PROBLEM_AREAS.map((p) => {
            const isSelected = problemAreas.includes(p.key);
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => toggleProblem(p.key)}
                className={`min-h-11 rounded-xl border bg-white p-4 text-center shadow-sm transition-colors ${
                  isSelected
                    ? "border-gold bg-gold/5"
                    : "border-neutral-300 hover:border-gold"
                }`}
              >
                <p.icon size={22} className={`mx-auto ${isSelected ? "text-gold" : "text-neutral-600"}`} />
                <p className="mt-1.5 text-xs font-medium">{p.label}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
            Retour
          </Button>
          <Button
            type="button"
            disabled={problemAreas.length === 0}
            onClick={() => setStep(2)}
            className="flex-1"
          >
            Continuer
          </Button>
        </div>
      </div>
    );
  }

  // Step 2 — one action: leave contact info and submit.
  return (
    <form onSubmit={handleSubmit} className={cardClasses("mt-8 space-y-4 p-6")}>
      <StepProgress step={3} total={3} />
      <p className="mb-2 font-medium">Vos coordonnées</p>

      <input
        type="text"
        required
        placeholder="Nom complet"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
      />
      <input
        type="tel"
        required
        placeholder="Numéro de téléphone (ex: 06XXXXXXXX)"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
      />
      <textarea
        placeholder="Détail supplémentaire (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
          Retour
        </Button>
        <Button type="submit" variant="accent" disabled={submitting} className="flex-1">
          {submitting ? "Envoi..." : "Demander une évaluation"}
        </Button>
      </div>
    </form>
  );
}
