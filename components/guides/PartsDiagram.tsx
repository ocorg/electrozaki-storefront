"use client";

import { useId, useState } from "react";
import type { WidgetsText } from "@/lib/guides/widgets";

// Guide 2: a drawn phone; tap a part (screen, battery, camera, Face ID) to
// read what changes when it's replaced. `texts` are the guide's own list
// items, in the same order.

const PARTS = ["screen", "battery", "camera", "faceId"] as const;
type Part = (typeof PARTS)[number];

// Where each hotspot sits on the drawing (percent of the phone's box).
const SPOT: Record<Part, string> = {
  faceId: "top-[2.5%] left-1/2 -translate-x-1/2",
  camera: "top-[19%] right-[5%]",
  screen: "top-[34%] left-1/2 -translate-x-1/2",
  battery: "top-[62%] left-1/2 -translate-x-1/2",
};

/** "**Écran** : selon le téléphone…" → "Selon le téléphone…" */
const body = (s: string) => {
  const rest = s.replace(/^\*\*[^*]+\*\*\s*[:：]?\s*/, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
};

export function PartsDiagram({ t, texts }: { t: WidgetsText["parts"]; texts: string[] }) {
  const id = useId();
  const [part, setPart] = useState<Part>("screen");
  const i = PARTS.indexOf(part);
  return (
    <section aria-labelledby={`${id}-t`} className="my-10 rounded-4xl bg-paper-2 p-5 sm:p-8">
      <p id={`${id}-t`} className="font-semibold text-neutral-700">
        {t.tapHint}
      </p>
      <div className="mt-5 grid items-center gap-8 sm:grid-cols-[220px_1fr]">
        {/* The drawing reads the same in every language. */}
        <div dir="ltr" className="relative mx-auto aspect-[9/18] w-[200px] rounded-[2.2rem] bg-ink p-2.5 shadow-[0_24px_50px_-28px_rgb(17_16_19/0.6)]">
          <div className={`h-full w-full rounded-[1.8rem] transition-colors ${part === "screen" ? "bg-gold/40" : "bg-[#2a2830]"}`} />
          <span
            aria-hidden
            className={`absolute left-1/2 top-[5%] h-4 w-16 -translate-x-1/2 rounded-full ${part === "faceId" ? "bg-gold" : "bg-black"}`}
          />
          <span
            aria-hidden
            className={`absolute right-[12%] top-[11%] h-9 w-9 rounded-xl border-2 ${part === "camera" ? "border-gold bg-gold/30" : "border-white/25"}`}
          />
          <span
            aria-hidden
            className={`absolute left-1/2 top-[58%] h-[24%] w-[56%] -translate-x-1/2 rounded-lg border-2 border-dashed ${
              part === "battery" ? "border-gold bg-gold/25" : "border-white/25"
            }`}
          />
          {PARTS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={part === p}
              onClick={() => setPart(p)}
              className={`absolute ${SPOT[p]} min-h-9 whitespace-nowrap rounded-full px-3 text-xs font-bold shadow ring-1 transition-colors ${
                part === p ? "bg-gold text-ink ring-gold" : "bg-white text-ink ring-ink/15"
              }`}
            >
              {t.names[p]}
            </button>
          ))}
        </div>
        <div aria-live="polite">
          <p className="font-display text-2xl font-bold text-ink">{t.names[part]}</p>
          <p className="mt-2 text-lg leading-relaxed text-neutral-800">{texts[i] ? body(texts[i]) : ""}</p>
        </div>
      </div>
    </section>
  );
}
