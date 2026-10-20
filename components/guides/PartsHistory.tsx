"use client";

import { useId, useState } from "react";
import type { WidgetsText } from "@/lib/guides/widgets";
import { IosScreen } from "./IosScreen";

// Guide 2: the iPhone's "Parts and Service History" screen, drawn, in its
// three states, so people recognise it on a real phone.

const STATES = ["genuine", "unknown", "used"] as const;

export function PartsHistory({ t, ios, drawn }: { t: WidgetsText["parts"]; ios: WidgetsText["ios"]; drawn: string }) {
  const id = useId();
  const [state, setState] = useState<(typeof STATES)[number]>("genuine");
  return (
    <section aria-labelledby={`${id}-t`} className="my-10 rounded-4xl bg-white p-5 ring-1 ring-ink/7 sm:p-8">
      <h2 id={`${id}-t`} className="font-display text-2xl font-bold text-ink">
        {t.title}
      </h2>
      <div className="mt-6 grid items-center gap-8 md:grid-cols-[1fr_300px]">
        <div>
          <div role="tablist" aria-label={t.title} className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                id={`${id}-${s}`}
                aria-selected={state === s}
                aria-controls={`${id}-panel`}
                onClick={() => setState(s)}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ring-1 transition-colors ${
                  state === s ? "bg-ink text-white ring-ink" : "bg-white text-neutral-700 ring-ink/15 hover:ring-ink/40"
                }`}
              >
                {t.states[s]}
              </button>
            ))}
          </div>
          <p id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${state}`} className="mt-5 text-lg leading-relaxed text-neutral-800">
            {t.explain[state]}
          </p>
        </div>
        <IosScreen
          back={ios.about}
          title={ios.partsHistory}
          caption={drawn}
          groups={[[{ label: ios.display, value: t.states[state], highlight: true }]]}
        />
      </div>
    </section>
  );
}
