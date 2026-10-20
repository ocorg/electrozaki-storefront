"use client";

import { useId, useState } from "react";
import { BatteryCharging, Wrench } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import type { WidgetsText } from "@/lib/guides/widgets";
import { BATTERY_GOOD_FROM } from "@/lib/battery";
import { IosScreen } from "./IosScreen";

// Guide 3: move the slider, see what a battery health figure means (label,
// share of the original battery life, the settings screen), then the
// iPhones in stock at that level or above, or a battery replacement.
export function BatterySlider({ t, ios, drawn }: { t: WidgetsText["battery"]; ios: WidgetsText["ios"]; drawn: string }) {
  const [v, setV] = useState(88);
  const id = useId();
  const level = v >= 90 ? "new" : v >= BATTERY_GOOD_FROM ? "good" : "worn";
  const tone = level === "worn" ? "text-red-700" : "text-signal";
  const bar = level === "worn" ? "from-red-500 to-red-400" : "from-gold via-gold-bright to-signal";

  return (
    <section aria-labelledby={`${id}-t`} className="my-10 rounded-4xl bg-white p-5 ring-1 ring-ink/7 sm:p-8">
      <h2 id={`${id}-t`} className="font-display text-2xl font-bold text-ink">
        {t.title}
      </h2>
      <div className="mt-6 grid items-center gap-8 md:grid-cols-[1fr_300px]">
        <div>
          <label htmlFor={`${id}-r`} className="text-sm font-semibold text-neutral-700">
            {t.slider}
          </label>
          {/* A gauge reads low → high left to right in every language. */}
          <div dir="ltr" className="mt-3">
            <input
              id={`${id}-r`}
              type="range"
              min={70}
              max={100}
              step={1}
              value={v}
              onChange={(e) => setV(Number(e.target.value))}
              className="w-full accent-[#c8922a]"
              aria-valuetext={`${v} % · ${t.levels[level]}`}
            />
            <div className="mt-5 flex items-end gap-3">
              <BatteryCharging size={30} aria-hidden className="text-gold-deep" />
              <p className="readout text-5xl font-bold text-ink">
                {v}
                <span className="text-2xl"> %</span>
              </p>
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-ink/10">
              <div className={`h-full rounded-full bg-linear-to-r ${bar} transition-[width] duration-200`} style={{ width: `${v}%` }} />
            </div>
          </div>
          <p aria-live="polite" className={`font-display mt-5 text-2xl font-bold ${tone}`}>
            {t.levels[level]}
          </p>
          <p className="mt-1 leading-relaxed text-neutral-700">{t.hints[level]}</p>
          <p className="mt-1 text-sm text-neutral-500">{t.life.replace("{v}", String(v))}</p>
          {level === "worn" ? (
            <LinkButton href="/reparation/batterie" variant="outline" className="mt-6">
              <Wrench size={18} aria-hidden /> {t.wornCta}
            </LinkButton>
          ) : (
            <LinkButton href={`/collections/telephones?brand=apple&minBattery=${v}`} variant="accent" className="mt-6">
              {t.cta.replace("{v}", String(v))}
            </LinkButton>
          )}
        </div>
        <IosScreen
          back={ios.battery}
          title={ios.batteryHealth}
          caption={drawn}
          groups={[[{ label: ios.maxCapacity, value: <span dir="ltr">{v} %</span>, highlight: true }]]}
        />
      </div>
    </section>
  );
}
