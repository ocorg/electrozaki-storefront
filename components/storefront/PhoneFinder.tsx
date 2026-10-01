"use client";

import { useState } from "react";
import { AnchorButton } from "@/components/ui/Button";
import { cardClasses } from "@/components/ui/Card";
import { StepProgress } from "@/components/ui/StepProgress";
import { useLocalePath, useT } from "@/components/i18n/I18nProvider";

// The answers' labels are in the dictionary (t.finder.*), in this order;
// only the values they stand for live here.
const BUDGET_MAX = [2000, 4000, 7000, undefined] as const;
// `tag` matches Product.tags — matches only start appearing once products
// are actually tagged this way; the mechanism is real today even before
// the catalog is tagged for it.
const USAGE_TAG = [undefined, "photo", "gaming", "productivite"] as const;
const BRANDS = ["Apple", "Samsung", "Xiaomi"] as const;

export function PhoneFinder() {
  const t = useT();
  const withLocale = useLocalePath();
  const [step, setStep] = useState(0);
  const [budget, setBudget] = useState<number | null>(null);
  const [usage, setUsage] = useState<number | null>(null);
  const [brand, setBrand] = useState<string | null>(null);

  if (step === 0) {
    return (
      <FinderStep step={1} question={t.finder.budgetQ}>
        <OptionGrid
          options={t.finder.budgets}
          onSelect={(i) => {
            setBudget(i);
            setStep(1);
          }}
        />
      </FinderStep>
    );
  }

  if (step === 1) {
    return (
      <FinderStep step={2} question={t.finder.usageQ} onBack={() => setStep(0)}>
        <OptionGrid
          options={t.finder.usages}
          onSelect={(i) => {
            setUsage(i);
            setStep(2);
          }}
        />
      </FinderStep>
    );
  }

  if (step === 2) {
    return (
      <FinderStep step={3} question={t.finder.brandQ} onBack={() => setStep(1)}>
        <OptionGrid
          options={[...BRANDS, t.finder.anyBrand]}
          onSelect={(i) => {
            setBrand(BRANDS[i] ?? null);
            setStep(3);
          }}
        />
      </FinderStep>
    );
  }

  const params = new URLSearchParams();
  const maxPrice = budget !== null ? BUDGET_MAX[budget] : undefined;
  const tag = usage !== null ? USAGE_TAG[usage] : undefined;
  if (maxPrice) params.set("maxPrice", String(maxPrice));
  if (tag) params.set("tag", tag);
  if (brand) params.set("brand", brand);

  return (
    <div className={cardClasses("p-6 text-center sm:p-8")}>
      <p className="font-display text-xl font-bold">{t.finder.done}</p>
      <AnchorButton href={withLocale(`/search?${params.toString()}`)} variant="accent" className="mt-5">
        {t.finder.seeResults}
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
        {t.finder.restart}
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
      <StepProgress step={step} total={3} onBackAction={onBack} />
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

function OptionGrid({ options, onSelect }: { options: readonly string[]; onSelect: (index: number) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(i)}
          className="group flex min-h-14 items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 py-3 text-start text-[15px] font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/5 active:scale-[0.98]"
        >
          {label}
          <span
            aria-hidden
            className="text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gold-deep rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          >
            →
          </span>
        </button>
      ))}
    </div>
  );
}
