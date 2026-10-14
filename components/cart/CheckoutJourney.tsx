"use client";

import { Check, Flag, MapPin, ShoppingBag, Truck, Wallet } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";

const ICONS = [ShoppingBag, MapPin, Wallet];

/**
 * The checkout as a delivery run: three stops (cart, delivery, payment) on a
 * track that fills as the customer moves on, a parcel truck riding to the
 * current stop, and the delivery date as the finish line once a city is
 * known. Stops already passed are buttons back to them.
 */
export function CheckoutJourney({
  step,
  onStepAction,
  arrival,
}: {
  step: 0 | 1 | 2;
  onStepAction: (step: 0 | 1 | 2) => void;
  /** "jeudi 16 octobre", or null until a city is chosen */
  arrival: string | null;
}) {
  const t = useT();
  const j = t.checkout.journey;
  const at = (i: number) => `${((1 + 2 * i) / 6) * 100}%`;

  return (
    <nav aria-label={j.aria} className="mb-8 overflow-hidden rounded-[1.5rem] bg-ink px-4 pb-5 pt-5 text-white on-dark sm:px-7">
      <div className="flex items-end justify-between gap-4">
        <p aria-live="polite" className="font-display text-lg font-bold leading-snug sm:text-xl">
          {j.lines[step]}
        </p>
        <p className="readout flex-none text-xs font-semibold text-white/55">{t.steps.step(step + 1, 3)}</p>
      </div>

      <div className="relative mt-4">
        {/* The truck, riding to the current stop. */}
        <div className="relative h-7" aria-hidden>
          <span
            className="absolute top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-[0_6px_16px_-6px_rgb(200_146_42/0.9)] motion-safe:transition-[left] motion-safe:duration-700 motion-safe:ease-out-quint rtl:translate-x-1/2"
            style={{ insetInlineStart: at(step) }}
          >
            <Truck size={15} strokeWidth={2.4} className="rtl:-scale-x-100" />
          </span>
        </div>

        <ol className="relative mt-1.5 grid grid-cols-3">
          {/* The road, and how much of it is behind. */}
          <span aria-hidden className="absolute top-4.5 h-1 rounded-full bg-white/12" style={{ insetInlineStart: at(0), insetInlineEnd: at(0) }} />
          <span
            aria-hidden
            className="absolute top-4.5 h-1 rounded-full bg-gold motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out-quint"
            style={{ insetInlineStart: at(0), width: `${(step / 2) * (200 / 3)}%` }}
          />
          {j.stops.map((name, i) => {
            const Icon = ICONS[i];
            const done = i < step;
            const current = i === step;
            const dot = (
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                  done ? "bg-gold text-ink" : current ? "bg-white text-ink ring-4 ring-gold/35" : "bg-ink-3 text-white/45 ring-1 ring-white/15"
                }`}
              >
                {done ? <Check size={18} strokeWidth={3} /> : <Icon size={17} strokeWidth={2.2} />}
              </span>
            );
            const label = (
              <span className={`mt-2 text-[13px] font-semibold ${current ? "text-white" : done ? "text-gold-bright" : "text-white/45"}`}>{name}</span>
            );
            return (
              <li key={name} className="relative flex flex-col items-center text-center" aria-current={current ? "step" : undefined}>
                {done ? (
                  <button
                    type="button"
                    onClick={() => onStepAction(i as 0 | 1 | 2)}
                    aria-label={j.goBack(name)}
                    className="group flex flex-col items-center rounded-xl"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110">{dot}</span>
                    {label}
                  </button>
                ) : (
                  <>
                    {dot}
                    {label}
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 border-t border-white/10 pt-3.5 text-[13px] sm:justify-start">
        <Flag size={15} className={arrival ? "text-gold-bright" : "text-white/40"} aria-hidden />
        {arrival ? (
          <span>
            {j.arrivalBefore} <b className="text-gold-bright">{arrival}</b>
          </span>
        ) : (
          <span className="text-white/55">{j.arrivalUnknown}</span>
        )}
      </p>
    </nav>
  );
}
