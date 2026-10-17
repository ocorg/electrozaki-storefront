import { ArrowDown, ChevronDown } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { OfferCopy } from "@/lib/offers/copy";

// The closing sections every phone offer page shares (a model's and a
// brand's): how ordering works, the questions people ask, the last call.

export function OfferSteps({ c }: { c: OfferCopy }) {
  return (
    <section aria-labelledby="steps" className="mx-auto max-w-7xl px-4 py-20 sm:py-24">
      <Reveal>
        <SectionHeading id="steps" eyebrow={c.steps.eyebrow} title={c.steps.title} />
      </Reveal>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {c.steps.items.map((s, i) => (
          <Reveal as="li" key={s.title}>
            <div className="h-full rounded-3xl bg-white p-6 ring-1 ring-ink/7">
              <p className="readout text-3xl font-bold text-gold-deep">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-display mt-3 text-lg font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function OfferFaq({ c, items }: { c: OfferCopy; items: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 pb-20">
      <Reveal>
        <SectionHeading id="faq" eyebrow={c.faq.eyebrow} title={c.faq.title} />
      </Reveal>
      <div className="mt-8 divide-y divide-ink/7 overflow-hidden rounded-3xl border border-ink/7 bg-white">
        {items.map((item) => (
          <details key={item.q} className="group open:bg-paper/60">
            <summary className="flex min-h-14 cursor-pointer list-none items-center px-5 py-4 font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex w-full items-center justify-between gap-4">
                {item.q}
                <ChevronDown size={18} aria-hidden className="flex-none text-neutral-500 transition-transform duration-300 group-open:rotate-180" />
              </span>
            </summary>
            <p className="px-5 pb-5 text-[15px] leading-relaxed text-neutral-700">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function OfferFinal({ title, text, cta }: { title: string; text: string; cta: string }) {
  return (
    <section className="px-4 pb-20">
      <div className="on-dark mx-auto flex max-w-5xl flex-col items-center rounded-4xl bg-ink px-6 py-14 text-center text-white">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
        <p className="mt-3 max-w-md text-neutral-300">{text}</p>
        <a
          href="#commander"
          className="mt-8 inline-flex min-h-13 items-center gap-2 rounded-full bg-gold px-8 text-base font-bold text-ink transition-[filter] hover:brightness-105"
        >
          {cta} <ArrowDown size={18} aria-hidden />
        </a>
      </div>
    </section>
  );
}
