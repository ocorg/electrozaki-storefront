import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { REPAIR_TOPICS } from "@/lib/repair-faq";
import { LinkButton } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  const data = REPAIR_TOPICS[topic];
  if (!data) return {};
  return {
    title: `${data.title} | Questions fréquentes`,
    description: data.intro,
  };
}

export default async function RepairTopicPage({ params }: Props) {
  const { topic } = await params;
  const data = REPAIR_TOPICS[topic];
  if (!data) notFound();

  return (
    <div>
      <section className="border-b border-black/10 bg-neutral-50 px-4 py-14 text-center">
        <Link
          href="/reparation"
          className="mx-auto mb-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-ink"
        >
          <ChevronLeft size={16} />
          Retour aux services de réparation
        </Link>
        <IconTile icon={data.icon} tone="gold" size={56} className="mx-auto" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">{data.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-neutral-600">{data.intro}</p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="text-xl font-bold sm:text-2xl">Questions fréquentes par marque</h2>
        <div className="mt-6 space-y-8">
          {data.brands.map((section, i) => (
            <Reveal key={section.brand} delayMs={i * 60}>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
                  {section.brand}
                </h3>
                <div className="mt-3 divide-y divide-black/10 rounded-xl border border-black/10 bg-white shadow-sm">
                  {section.entries.map((entry) => (
                    <details key={entry.question} className="group p-4 open:bg-neutral-50">
                      <summary className="cursor-pointer list-none font-medium marker:content-none">
                        <span className="flex items-center justify-between gap-4">
                          {entry.question}
                          <ChevronLeft
                            size={16}
                            className="flex-none -rotate-90 text-neutral-400 transition-transform group-open:rotate-90"
                          />
                        </span>
                      </summary>
                      <p className="mt-3 text-sm text-neutral-600">{entry.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-black/10 bg-ink px-4 py-14 text-center text-white">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Votre cas ne correspond à aucune de ces questions ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-300">
          Chaque appareil est différent — demandez un diagnostic gratuit ou décrivez votre panne
          directement sur WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/reparation#diagnostic" variant="accent">
            Demander un diagnostic
          </LinkButton>
          <a
            href="https://wa.me/212667654430"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white transition-colors hover:border-gold"
          >
            Discuter sur WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
