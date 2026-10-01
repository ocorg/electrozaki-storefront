import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { isRepairSlug } from "@/lib/repair-faq";
import { getRepairTopics } from "@/lib/i18n/repair";
import { getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { LinkButton } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";
import { WHATSAPP_URL } from "@/lib/site";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd, faqJsonLd } from "@/lib/json-ld";

type Props = { params: Promise<{ topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topic } = await params;
  if (!isRepairSlug(topic)) return {};
  const [topics, t, locale] = await Promise.all([getRepairTopics(), getT(), getLocale()]);
  const data = topics[topic];
  // Meta descriptions are cut around 155 characters in results: end on a word.
  const description = data.intro.length > 155 ? `${data.intro.slice(0, 152).replace(/\s+\S*$/, "")}…` : data.intro;
  const alt = alternates(locale, `/reparation/${topic}`);
  return {
    title: t.repairTopic.metaTitle(data.title),
    description,
    alternates: alt,
    openGraph: { title: `${data.title} | Electro Zaki`, description, url: alt.canonical },
  };
}

export default async function RepairTopicPage({ params }: Props) {
  const { topic } = await params;
  if (!isRepairSlug(topic)) notFound();
  const [topics, t, locale] = await Promise.all([getRepairTopics(), getT(), getLocale()]);
  const data = topics[topic];
  const rt = t.repairTopic;

  return (
    <div>
      <JsonLd data={faqJsonLd(locale, data.brands.flatMap((b) => b.entries))} />
      <section className="on-dark pcb text-white">
        <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:pb-16">
          <Breadcrumbs
            tone="dark"
            items={[
              { name: t.common.home, path: "/" },
              { name: t.common.repair, path: "/reparation" },
              { name: data.shortTitle, path: `/reparation/${topic}` },
            ]}
          />
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-start">
            <IconTile icon={data.icon} size={64} className="ring-1 ring-gold/40" />
            <div>
              <h1 className="font-display text-[2.4rem] font-extrabold leading-none sm:text-6xl">{data.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">{data.intro}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <h2 className="font-display text-3xl font-bold text-ink">{rt.faqByBrand}</h2>
        <div className="mt-6 space-y-8">
          {data.brands.map((section, i) => (
            <Reveal key={section.brand} delayMs={i * 60}>
              <div>
                <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">
                  {section.brand}
                </h3>
                <div className="mt-3 divide-y divide-ink/7 overflow-hidden rounded-3xl border border-ink/7 bg-white">
                  {section.entries.map((entry) => (
                    <details key={entry.question} className="group open:bg-paper/60">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center px-5 py-4 font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                        <span className="flex w-full items-center justify-between gap-4">
                          {entry.question}
                          <ChevronDown
                            size={18}
                            aria-hidden
                            className="flex-none text-neutral-500 transition-transform duration-300 group-open:rotate-180"
                          />
                        </span>
                      </summary>
                      <p className="px-5 pb-5 text-[15px] leading-relaxed text-neutral-700">{entry.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="on-dark mx-4 mb-4 rounded-4xl bg-ink px-4 py-14 text-center text-white sm:mx-auto sm:max-w-5xl">
        <h2 className="text-2xl font-bold sm:text-3xl">{rt.notListedTitle}</h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-300">{rt.notListedText}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <LinkButton href="/reparation#diagnostic" variant="accent">
            {rt.askDiagnostic}
          </LinkButton>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-whatsapp px-6 text-[15px] font-semibold text-ink transition-[filter] hover:brightness-105"
          >
            {t.repairPage.chatWhatsapp}
          </a>
        </div>
      </section>
    </div>
  );
}
