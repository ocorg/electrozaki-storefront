import { ChevronLeft } from "lucide-react";

export function StepProgress({
  step,
  total,
  onBack,
}: {
  step: number;
  total: number;
  onBack?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Étape {step} / {total}
      </p>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-9 items-center gap-1 rounded px-2 text-sm font-medium text-neutral-500 transition-colors hover:text-ink"
        >
          <ChevronLeft size={16} />
          Retour
        </button>
      )}
    </div>
  );
}
