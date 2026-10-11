import type { ReactNode } from "react";
import Image from "next/image";
import { Check, ChevronDown, RotateCcw } from "lucide-react";
import Link from "@/components/i18n/Link";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import type { ArtKind } from "@/lib/category-art";
import { getT } from "@/lib/i18n/server";

export type GuideOption = {
  key: string;
  label: string;
  /** a second line under the label (a budget band's price range) */
  detail?: string;
  /** how many products this option would leave, given the other answers */
  count: number;
  on: boolean;
  /** picks the option, or clears it when it is already picked */
  href: string;
  /** tiles: a photo of a product that has this option */
  image?: string | null;
  /** meters: 1 = lightest */
  level?: number | null;
};

export type GuideStep = {
  key: string;
  question: string;
  kind: "chips" | "tiles" | "meter";
  options: GuideOption[];
};

/**
 * An aisle's guided choice: a few questions (which phone, who for, which
 * style…) built from the checklist staff tick in the ERP. Every option is a
 * plain link that narrows the grid below, so each combination has its own
 * shareable address and the guide works without JavaScript. Answered
 * questions fold away; the next one is open.
 */
export async function AisleGuide({
  steps,
  total,
  restartHref,
  art,
  remembered,
}: {
  steps: GuideStep[];
  total: number;
  /** null while nothing is picked */
  restartHref: string | null;
  art: ArtKind;
  /** the "is your phone an iPhone 13?" shortcut, when the page has one */
  remembered?: ReactNode;
}) {
  const t = await getT();
  const answered = steps.filter((s) => s.options.some((o) => o.on));
  const next = steps.find((s) => !s.options.some((o) => o.on));

  return (
    <section aria-labelledby="guide-title" className="mt-6 overflow-hidden rounded-[1.75rem] bg-ink text-white sm:mt-8">
      <div className="flex flex-col gap-3 px-5 pb-4 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:px-7 sm:pt-6">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-bright">{t.guide.eyebrow}</p>
          <h2 id="guide-title" className="font-display mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
            {t.guide.title}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/65">{t.guide.lead}</p>
        </div>
        {/* One dot per question: gold once answered. */}
        <p className="flex flex-none items-center gap-2 pb-1">
          <span className="flex gap-1" aria-hidden>
            {steps.map((s) => (
              <span key={s.key} className={`h-1.5 w-4 rounded-full ${answered.includes(s) ? "bg-gold" : "bg-white/15"}`} />
            ))}
          </span>
          <span className="readout text-xs font-semibold text-white/65">{t.guide.stepsDone(answered.length, steps.length)}</span>
        </p>
      </div>

      {remembered}

      <ol className="divide-y divide-white/8 border-t border-white/8">
        {steps.map((step, i) => {
          const picked = step.options.find((o) => o.on);
          return (
            <li key={step.key}>
              <details open={step === next} className="group/step">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-2.5 transition-colors hover:bg-white/4 sm:px-7 [&::-webkit-details-marker]:hidden">
                  <span
                    aria-hidden
                    className={`readout flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold ${
                      picked ? "bg-gold text-ink" : "text-white/70 ring-1 ring-white/25"
                    }`}
                  >
                    {picked ? <Check size={15} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`min-w-0 flex-1 text-[15px] font-semibold ${picked ? "text-white/65" : "text-white"}`}>
                    {step.question}
                  </span>
                  {picked ? (
                    <span className="min-w-0 truncate text-[15px] font-bold text-gold-bright">{picked.label}</span>
                  ) : (
                    // A taste of the answers while the question is folded.
                    <span aria-hidden className="hidden min-w-0 truncate text-sm text-white/35 group-open/step:hidden sm:block">
                      {step.options.slice(0, 4).map((o) => o.label).join(" · ")}
                    </span>
                  )}
                  <span className="flex flex-none items-center gap-1 text-xs font-semibold text-white/50">
                    {picked && <span className="hidden sm:inline">{t.guide.change}</span>}
                    <ChevronDown size={17} aria-hidden className="transition-transform duration-300 group-open/step:rotate-180" />
                  </span>
                </summary>

                <div className="px-5 pb-5 pt-1 sm:px-7">
                  {step.kind === "tiles" ? (
                    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {step.options.map((o) => (
                        <li key={o.key}>
                          <Tile option={o} art={art} />
                        </li>
                      ))}
                    </ul>
                  ) : step.kind === "meter" ? (
                    <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(step.options.length, 4)}, minmax(0, 1fr))` }}>
                      {step.options.map((o) => (
                        <li key={o.key}>
                          <Meter option={o} max={Math.max(...step.options.map((x) => x.level ?? 0), 1)} srLevel={t.guide.level} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {step.options.map((o) => (
                        <li key={o.key}>
                          <Choice option={o} className="min-h-11 rounded-full px-4">
                            <span className={o.detail ? "leading-tight" : undefined}>
                              <span className="block text-sm font-semibold">{o.label}</span>
                              {o.detail && <span className="readout block text-[11px] opacity-70">{o.detail}</span>}
                            </span>
                          </Choice>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-white/8 bg-white/4 px-5 py-3.5 sm:px-7">
        <p aria-live="polite" className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <span className="readout font-bold text-white">{t.guide.results(total)}</span>
          {answered.map((s) => (
            <span key={s.key} className="text-white/65">
              · {s.options.find((o) => o.on)!.label}
            </span>
          ))}
        </p>
        {restartHref && (
          <Link
            href={restartHref}
            scroll={false}
            className="inline-flex min-h-9 flex-none items-center gap-1.5 text-[13px] font-semibold text-white/75 underline underline-offset-2 hover:text-white"
          >
            <RotateCcw size={13} aria-hidden /> {t.guide.restart}
          </Link>
        )}
      </div>
    </section>
  );
}

// An option as a link, lit when picked. One that would leave nothing (given
// the other answers) stays visible but can't be followed.
function Choice({ option, className, children }: { option: GuideOption; className: string; children: ReactNode }) {
  const base = `flex items-center gap-2 transition-colors ${className}`;
  if (option.count === 0 && !option.on) {
    return (
      <span aria-disabled className={`${base} text-white/30 ring-1 ring-white/8`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={option.href}
      scroll={false}
      aria-pressed={option.on}
      className={`${base} ${
        option.on ? "bg-gold text-ink" : "bg-white/8 text-white ring-1 ring-white/12 hover:bg-white/14 hover:ring-white/30"
      }`}
    >
      {children}
    </Link>
  );
}

function Tile({ option, art }: { option: GuideOption; art: ArtKind }) {
  return (
    <Choice option={option} className="group/tile relative aspect-square flex-col justify-end overflow-hidden rounded-2xl p-0!">
      {option.image ? (
        <Image
          src={option.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 33vw"
          className="bg-white object-contain p-2 pb-9 transition-transform duration-500 ease-out-quint group-hover/tile:scale-105"
        />
      ) : (
        <DeviceArt kind={art} className="absolute inset-x-0 top-[10%] mx-auto h-[50%] w-auto opacity-80" />
      )}
      <span
        className={`relative flex w-full items-center justify-between gap-1 px-2.5 py-2 text-[13px] font-bold leading-tight ${
          option.on ? "bg-gold text-ink" : option.image ? "bg-ink/85 text-white backdrop-blur-sm" : ""
        }`}
      >
        <span className="min-w-0 truncate">{option.label}</span>
        {option.on ? <Check size={14} strokeWidth={3} aria-hidden /> : <span className="readout text-[11px] font-semibold opacity-60">{option.count}</span>}
      </span>
    </Choice>
  );
}

// A step on an ordered scale ("Fine" → "Antichoc"), drawn like the phone
// grade's signal bars; the name is always written next to them.
function Meter({ option, max, srLevel }: { option: GuideOption; max: number; srLevel: (n: number, max: number) => string }) {
  const level = option.level ?? 0;
  return (
    <Choice option={option} className="min-h-18 flex-col items-start justify-center gap-2 rounded-2xl px-3.5 py-3">
      <span className="flex items-end gap-0.75" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`w-1.5 rounded-[1px] ${i < level ? (option.on ? "bg-ink" : "bg-gold") : option.on ? "bg-ink/20" : "bg-white/20"}`}
            style={{ height: 8 + i * 5 }}
          />
        ))}
      </span>
      <span className="text-sm font-bold leading-tight">
        {option.label}
        {level > 0 && <span className="sr-only"> ({srLevel(level, max)})</span>}
      </span>
    </Choice>
  );
}
