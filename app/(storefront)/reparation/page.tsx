import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { RepairDiagnostic } from "@/components/storefront/RepairDiagnostic";
import { RepairHeroArt } from "@/components/storefront/RepairHeroArt";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REPAIR_TOPIC_ORDER, REPAIR_TOPICS, SOFTWARE_TOPIC_ORDER, type RepairTopic } from "@/lib/repair-faq";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Réparation de téléphone à Meknès — écran, batterie, logiciel",
  description:
    "Réparation de téléphones à Meknès : écran, batterie, port de charge, problèmes logiciels, récupération de données et consultation en ligne. Devis gratuit, suivi en ligne.",
  alternates: { canonical: "/reparation" },
  openGraph: {
    title: "Réparation de téléphone à Meknès | Electro Zaki",
    description: "Écran, batterie, port de charge, logiciel : devis gratuit avant toute réparation, suivi en ligne.",
    url: "/reparation",
  },
};

const HARDWARE = REPAIR_TOPIC_ORDER.map((slug) => REPAIR_TOPICS[slug]);
const SOFTWARE = SOFTWARE_TOPIC_ORDER.map((slug) => REPAIR_TOPICS[slug]);
const CONSULTATION = REPAIR_TOPICS["consultation-en-ligne"];

// How a repair goes, from the promises the shop already makes (free quote
// before any work, online tracking with the DEM/REP number).
const STEPS = [
  { n: "01", title: "Diagnostic", text: "Décrivez la panne en quelques clics, ou passez en boutique." },
  { n: "02", title: "Devis gratuit", text: "Vous connaissez le prix avant toute réparation. Sans engagement." },
  { n: "03", title: "Réparation", text: "Votre appareil est pris en charge par nos techniciens." },
  { n: "04", title: "Suivi en ligne", text: "Suivez l'avancement avec votre numéro et votre téléphone." },
];

function ServiceGrid({ title, services, index }: { title: string; services: RepairTopic[]; index: number }) {
  return (
    <div>
      <h3 className="flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">
        <span className="h-px w-8 bg-gold" aria-hidden />
        {title}
      </h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <Reveal as="li" key={s.slug} delayMs={(index + i) * 40}>
            <Link
              href={`/reparation/${s.slug}`}
              className="group flex h-full flex-col rounded-[1.5rem] border border-ink/[0.07] bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_44px_-26px_rgb(17_16_19/0.45)]"
            >
              <div className="flex items-start justify-between">
                <IconTile icon={s.icon} tone="gold" size={48} />
                <ArrowUpRight
                  size={18}
                  aria-hidden
                  className="text-neutral-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                />
              </div>
              <h4 className="font-display mt-5 text-xl font-bold text-ink">{s.shortTitle}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{s.cardDescription}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep">
                Questions fréquentes
                <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export default function ReparationPage() {
  return (
    <div>
      <section aria-labelledby="repair-title" className="on-dark pcb relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:pb-20 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-200">
              Atelier · Meknès
            </p>
            <h1 id="repair-title" className="font-display mt-6 text-[2.7rem] font-extrabold leading-[0.95] sm:text-[4rem] xl:text-[4.8rem]">
              Votre téléphone cassé ? <span className="text-gold">On s&apos;en occupe.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
              Matériel ou logiciel, en boutique ou en consultation en ligne : devis gratuit avant toute réparation, et
              suivi de votre appareil en ligne.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AnchorButton href="#diagnostic" variant="accent" size="lg" className="px-6 sm:px-8">
                Demander un devis <ArrowRight size={18} aria-hidden />
              </AnchorButton>
              {/* Was the light-surface outline on ink: white text on a white fill (1:1). */}
              <LinkButton href="/reparation/suivi" variant="outline-dark" size="lg" className="px-6 sm:px-8">
                Suivre ma réparation
              </LinkButton>
            </div>
            <ul className="mt-10 flex flex-wrap gap-2">
              {HARDWARE.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/reparation/${s.slug}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 px-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:border-gold hover:text-white"
                  >
                    <s.icon size={15} aria-hidden className="text-gold" />
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto hidden w-full max-w-[300px] sm:block">
            <div aria-hidden className="absolute inset-0 -z-0 rounded-full bg-gold/25 blur-[90px]" />
            <RepairHeroArt className="relative w-full drop-shadow-[0_40px_60px_rgb(0_0_0/0.7)]" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-label="Comment ça marche" className="border-b border-ink/10 bg-paper-2/60">
        <ol className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delayMs={i * 80} className="py-8 lg:pr-8">
              <p className="readout text-3xl font-bold text-gold-deep">{s.n}</p>
              <p className="font-display mt-2 text-xl font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="diagnostic" aria-labelledby="diag" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-32">
            <SectionHeading
              id="diag"
              index="01"
              eyebrow="Diagnostic"
              title="Demander un diagnostic ou un devis."
              intro="Quelques étapes rapides, sans avoir à décrire techniquement le problème. Vous recevez un numéro de demande tout de suite."
            />
          </Reveal>
          <div className="rounded-[2rem] bg-paper-2 p-3 sm:p-5">
            <RepairDiagnostic />
          </div>
        </div>
      </section>

      <section aria-labelledby="services" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <Reveal>
          <SectionHeading id="services" index="02" eyebrow="Services" title="Nos services de réparation." />
        </Reveal>
        <div className="mt-10 space-y-12">
          <ServiceGrid title="Réparation matérielle" services={HARDWARE} index={0} />
          <ServiceGrid title="Problèmes logiciels" services={SOFTWARE} index={0} />
          <ServiceGrid title="À distance" services={[CONSULTATION]} index={0} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <Reveal>
          <div className="on-dark relative flex flex-col items-start gap-6 overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Une question sur votre appareil ?</h2>
              <p className="mt-3 text-neutral-300">
                Envoyez-nous une photo ou décrivez le problème sur WhatsApp — réponse rapide, sans engagement.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AnchorButton
                href={whatsappLink("Bonjour, j'ai un problème avec mon téléphone :")}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
              >
                <MessageCircle size={18} aria-hidden /> Discuter sur WhatsApp
              </AnchorButton>
              <LinkButton href="/reparation/suivi" variant="outline-dark" size="lg">
                Suivre ma réparation
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
