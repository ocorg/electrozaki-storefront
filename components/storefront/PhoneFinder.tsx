"use client";

import { useState } from "react";
import { AnchorButton } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { StepProgress } from "@/components/ui/StepProgress";

const BUDGETS = [
  { label: "Moins de 2 000 DH", maxPrice: 2000 },
  { label: "2 000 – 4 000 DH", maxPrice: 4000 },
  { label: "4 000 – 7 000 DH", maxPrice: 7000 },
  { label: "Plus de 7 000 DH", maxPrice: undefined },
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
    <div className={cardClasses("p-6 text-center sm:p-8")}>
      <p className="font-display text-xl font-bold">Merci ! Voici nos suggestions.</p>
      <AnchorButton href={`/search?${params.toString()}`} variant="accent" className="mt-5">
        Voir les téléphones proposés
      </AnchorButton>
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setBudget(null);
          setUsage(null);
          setBrand(null);
        }}
        className="mt-3 block min-h-11 w-full text-sm font-medium text-neutral-600 underline underline-offset-4 hover:text-ink"
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
    <div className={cardClasses("p-6 sm:p-8")}>
      <StepProgress step={step} total={3} onBack={onBack} />
      <div aria-hidden className="-mt-2 mb-5 flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${n <= step ? "bg-gold" : "bg-ink/10"}`} />
        ))}
      </div>
      <p className="font-display mb-5 text-xl font-bold text-ink">{question}</p>
      {children}
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
          className="group flex min-h-14 items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-left text-[15px] font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/5 active:scale-[0.98]"
        >
          {label}
          <span aria-hidden className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-deep">→</span>
        </button>
      ))}
    </div>
  );
}
