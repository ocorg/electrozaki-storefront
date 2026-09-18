"use client";

import { useState } from "react";

const BUDGETS = [
  { label: "Moins de 2 000 MAD", maxPrice: 2000 },
  { label: "2 000 – 4 000 MAD", maxPrice: 4000 },
  { label: "4 000 – 7 000 MAD", maxPrice: 7000 },
  { label: "Plus de 7 000 MAD", maxPrice: undefined },
] as const;

// `tag` matches Product.tags — matches only start appearing once products
// are actually tagged this way; the mechanism is real today even before
// the catalog is tagged for it.
const USAGES = [
  { label: "Appels & SMS", tag: undefined },
  { label: "Réseaux sociaux & Photos", tag: "photo" },
  { label: "Gaming & Performance", tag: "gaming" },
  { label: "Pro & Multitâche", tag: "productivite" },
] as const;

const BRANDS = ["Apple", "Samsung", "Xiaomi", "Peu importe"] as const;

export function PhoneFinder() {
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<(typeof BUDGETS)[number] | null>(null);
  const [usage, setUsage] = useState<(typeof USAGES)[number] | null>(null);
  const [brand, setBrand] = useState<string | null>(null);

  if (step === 0) {
    return (
      <FinderStep step={1} question="Quel est votre budget ?">
        <OptionGrid
          options={BUDGETS.map((b) => b.label)}
          onSelect={(label) => {
            setBudget(BUDGETS.find((b) => b.label === label) ?? null);
            setStep(1);
          }}
        />
      </FinderStep>
    );
  }

  if (step === 1) {
    return (
      <FinderStep step={2} question="Quel est votre usage principal ?" onBack={() => setStep(0)}>
        <OptionGrid
          options={USAGES.map((u) => u.label)}
          onSelect={(label) => {
            setUsage(USAGES.find((u) => u.label === label) ?? null);
            setStep(2);
          }}
        />
      </FinderStep>
    );
  }

  if (step === 2) {
    return (
      <FinderStep step={3} question="Une marque en tête ?" onBack={() => setStep(1)}>
        <OptionGrid
          options={[...BRANDS]}
          onSelect={(label) => {
            setBrand(label === "Peu importe" ? null : label);
            setStep(3);
          }}
        />
      </FinderStep>
    );
  }

  const params = new URLSearchParams();
  if (budget?.maxPrice) params.set("maxPrice", String(budget.maxPrice));
  if (usage?.tag) params.set("tag", usage.tag);
  if (brand) params.set("brand", brand);

  return (
    <div className="mt-8 rounded-lg border border-black/10 p-6 text-center">
      <p className="font-medium">Merci ! Voici nos suggestions.</p>
      <a
        href={`/search?${params.toString()}`}
        className="mt-4 inline-block rounded bg-[#c8922a] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
      >
        Voir les résultats
      </a>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setBudget(null);
          setUsage(null);
          setBrand(null);
        }}
        className="mt-3 block w-full text-sm text-neutral-500 underline"
      >
        Recommencer
      </button>
    </div>
  );
}

function FinderStep({
  step,
  question,
  onBack,
  children,
}: {
  step: number;
  question: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8 rounded-lg border border-black/10 p-6">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Étape {step} / 3
      </p>
      <p className="mb-4 font-medium">{question}</p>
      {children}
      {onBack && (
        <button type="button" onClick={onBack} className="mt-4 inline-block min-h-11 px-2 py-2 text-sm text-neutral-500 underline">
          Retour
        </button>
      )}
    </div>
  );
}

function OptionGrid({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (label: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="min-h-11 rounded border border-black/10 px-4 py-3 text-left text-sm transition-colors hover:border-[#c8922a] hover:bg-[#c8922a]/5"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
