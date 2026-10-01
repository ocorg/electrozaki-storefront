import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { RepairDiagnostic } from "@/components/storefront/RepairDiagnostic";
import { RepairHeroArt } from "@/components/storefront/RepairHeroArt";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { REPAIR_TOPIC_ORDER, SOFTWARE_TOPIC_ORDER, type RepairTopic } from "@/lib/repair-faq";
import { getRepairTopics } from "@/lib/i18n/repair";
import { getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { whatsappLink } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const r = t.repairPage;
  const alt = alternates(locale, "/reparation");
  return {
    title: r.metaTitle,
    description: r.metaDescription,
    alternates: alt,
    openGraph: { title: `${r.ogTitle} | Electro Zaki`, description: r.ogDescription, url: alt.canonical },
  };
}

function ServiceGrid({
  title,
  services,
  index,
  faqLabel,
}: {
  title: string;
  services: RepairTopic[];
  index: number;
  faqLabel: string;
}) {
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
              className="group flex h-full flex-col rounded-3xl border border-ink/7 bg-white p-6 transition-[transform,box-shadow,border-color] duration-500 ease-out-quint hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_44px_-26px_rgb(17_16_19/0.45)]"
            >
              <div className="flex items-start justify-between">
                <IconTile icon={s.icon} tone="gold" size={48} />
                <ArrowUpRight
                  size={18}
                  aria-hidden
                  className="text-neutral-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                />
              </div>
              <h4 className="font-display mt-5 text-xl font-bold text-ink">{s.shortTitle}</h4>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-neutral-600">{s.cardDescription}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-deep">
                {faqLabel}
                <ArrowRight
                  size={15}
                  aria-hidden
                  className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}

export default async function ReparationPage() {
  const [t, topics] = await Promise.all([getT(), getRepairTopics()]);
  const r = t.repairPage;
  const hardware = REPAIR_TOPIC_ORDER.map((slug) => topics[slug]);
  const software = SOFTWARE_TOPIC_ORDER.map((slug) => topics[slug]);
  const consultation = topics["consultation-en-ligne"];

  return (
    <div>
      <section aria-labelledby="repair-title" className="on-dark pcb relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.25fr_1fr] lg:pb-20 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-200">
              {r.eyebrow}
            </p>
            <h1 id="repair-title" className="font-display mt-6 text-[2.7rem] font-extrabold leading-[0.95] sm:text-[4rem] xl:text-[4.8rem]">
              {r.title} <span className="text-gold">{r.titleGold}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">{r.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <AnchorButton href="#diagnostic" variant="accent" size="lg" className="px-6 sm:px-8">
                {r.askQuote} <ArrowRight size={18} aria-hidden className="rtl:rotate-180" />
              </AnchorButton>
              {/* Was the light-surface outline on ink: white text on a white fill (1:1). */}
              <LinkButton href="/reparation/suivi" variant="outline-dark" size="lg" className="px-6 sm:px-8">
                {r.track}
              </LinkButton>
            </div>
            <ul className="mt-10 flex flex-wrap gap-2">
              {hardware.map((s) => (
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
          <div className="relative mx-auto hidden w-full max-w-75 sm:block">
            <div aria-hidden className="absolute inset-0 z-0 rounded-full bg-gold/25 blur-[90px]" />
            <RepairHeroArt className="relative w-full drop-shadow-[0_40px_60px_rgb(0_0_0/0.7)]" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-label={r.howItWorks} className="border-b border-ink/10 bg-paper-2/60">
        <ol className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-2 lg:grid-cols-4">
          {r.steps.map((s, i) => (
            <Reveal as="li" key={s.title} delayMs={i * 80} className="py-8 lg:pe-8">
              <p className="readout text-3xl font-bold text-gold-deep">{String(i + 1).padStart(2, "0")}</p>
              <p className="font-display mt-2 text-xl font-bold text-ink">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="diagnostic" aria-labelledby="diag" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <Reveal className="lg:sticky lg:top-32">
            <SectionHeading id="diag" index="01" eyebrow={r.diagEyebrow} title={r.diagTitle} intro={r.diagIntro} />
          </Reveal>
          <div className="rounded-4xl bg-paper-2 p-3 sm:p-5">
            <RepairDiagnostic />
          </div>
        </div>
      </section>

      <section aria-labelledby="services" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <Reveal>
          <SectionHeading id="services" index="02" eyebrow={r.servicesEyebrow} title={r.servicesTitle} />
        </Reveal>
        <div className="mt-10 space-y-12">
          <ServiceGrid title={r.hardware} services={hardware} index={0} faqLabel={r.faq} />
          <ServiceGrid title={r.software} services={software} index={0} faqLabel={r.faq} />
          <ServiceGrid title={r.remote} services={[consultation]} index={0} faqLabel={r.faq} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <Reveal>
          <div className="on-dark relative flex flex-col items-start gap-6 overflow-hidden rounded-4xl bg-ink px-6 py-12 text-white sm:px-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">{r.questionTitle}</h2>
              <p className="mt-3 text-neutral-300">{r.questionText}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AnchorButton
                href={whatsappLink(r.waProblem)}
                target="_blank"
                rel="noopener noreferrer"
                variant="whatsapp"
                size="lg"
              >
                <MessageCircle size={18} aria-hidden /> {r.chatWhatsapp}
              </AnchorButton>
              <LinkButton href="/reparation/suivi" variant="outline-dark" size="lg">
                {r.track}
              </LinkButton>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
