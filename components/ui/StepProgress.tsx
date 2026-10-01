"use client";

import { ChevronLeft } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

export function StepProgress({
  step,
  total,
  onBackAction,
}: {
  step: number;
  total: number;
  onBackAction?: () => void;
}) {
  const t = useT();
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-500">{t.steps.step(step, total)}</p>
      {onBackAction && (
        <button
          type="button"
          onClick={onBackAction}
          className="inline-flex min-h-9 items-center gap-1 rounded px-2 text-sm font-medium text-neutral-500 transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} className="rtl:rotate-180" aria-hidden />
          {t.steps.back}
        </button>
      )}
    </div>
  );
}
