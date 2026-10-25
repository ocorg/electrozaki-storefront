import type { Metadata } from "next";
import { MessageCircle, RotateCcw } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnchorButton } from "@/components/ui/Button";
import { getLocale, getT } from "@/lib/i18n/server";
import { LOCALE_META } from "@/lib/i18n/config";
import { alternates } from "@/lib/i18n/seo";
import { TERMS, TERMS_UPDATED } from "@/lib/legal";
import { LEGAL, SHOP, SITE_URL, TERMS_PATH, WHATSAPP_URL } from "@/lib/site";
import { clipDescription, pageTitle } from "@/lib/seo-fit";

// The terms of sale (law 31-08): who sells, how ordering, payment and
// delivery work, the 7-day return right (#retours), warranties and data.
// Linked from the footer and from the box every customer ticks before
// ordering; Google's return-policy data points to #retours.

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const c = TERMS[locale];
  const alt = alternates(locale, TERMS_PATH);
  return {
    title: pageTitle(c.metaTitle),
    description: clipDescription(c.metaDescription),
    alternates: alt,
    openGraph: { title: `${c.metaTitle} | Electro Zaki`, description: c.metaDescription, url: alt.canonical },
  };
}

export default async function TermsPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const c = TERMS[locale];
  const updated = new Date(`${TERMS_UPDATED}T12:00:00Z`).toLocaleDateString(`${LOCALE_META[locale].intl}-u-nu-latn`, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Only the identifiers the shop has given: never an example number.
  const seller: [string, string][] = [
    [c.seller.legalName, LEGAL.legalName],
    [c.seller.tradeName, LEGAL.tradeName],
    [c.seller.address, LEGAL.address],
    [c.seller.phone, SHOP.whatsappDisplay],
    [c.seller.website, SITE_URL.replace(/^https?:\/\//, "")],
    ...(LEGAL.rc ? [[c.seller.rc, LEGAL.rc] as [string, string]] : []),
    ...(LEGAL.ice ? [[c.seller.ice, LEGAL.ice] as [string, string]] : []),
    ...(LEGAL.fiscalId ? [[c.seller.fiscalId, LEGAL.fiscalId] as [string, string]] : []),
    ...(LEGAL.tp ? [[c.seller.tp, LEGAL.tp] as [string, string]] : []),
    ...(LEGAL.email ? [[c.seller.email, LEGAL.email] as [string, string]] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-8">
      <Breadcrumbs
        items={[
          { name: t.common.home, path: "/" },
          { name: c.title, path: TERMS_PATH },
        ]}
      />
      <h1 className="font-display mt-6 text-[2.2rem] font-extrabold leading-[1.05] text-ink sm:text-5xl">{c.title}</h1>
      <p className="mt-3 text-sm text-neutral-500">{c.updated(updated)}</p>
      <p className="mt-5 text-lg leading-relaxed text-neutral-700">{c.intro}</p>

      <section aria-labelledby="essentiel" className="mt-8 rounded-3xl border border-gold/40 bg-gold/8 p-5 sm:p-6">
        <h2 id="essentiel" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <RotateCcw size={20} className="text-gold-deep" aria-hidden /> {c.summaryTitle}
        </h2>
        <ul className="mt-3 space-y-2 text-neutral-800">
          {c.summary.map((line) => (
            <li key={line} className="flex gap-2.5 leading-relaxed">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-gold-deep" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="vendeur" className="mt-10 scroll-mt-28">
        <h2 id="vendeur" className="font-display text-2xl font-bold text-ink">
          {c.seller.title}
        </h2>
        <dl className="mt-4 divide-y divide-ink/7 rounded-[1.25rem] bg-white px-5 ring-1 ring-ink/7">
          {seller.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:justify-between sm:gap-6">
              <dt className="text-neutral-600">{label}</dt>
              <dd dir="auto" className="font-semibold text-ink sm:text-end">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {c.sections.map((s) => (
        <section key={s.id} id={s.id} aria-labelledby={`h-${s.id}`} className="mt-10 scroll-mt-28">
          <h2 id={`h-${s.id}`} className="font-display text-2xl font-bold text-ink">
            {s.title}
          </h2>
          <div className="mt-3 space-y-3 leading-relaxed text-neutral-700">
            {s.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.list && (
              <ul className="list-disc space-y-1.5 ps-6">
                {s.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      ))}

      <AnchorButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="whatsapp" className="mt-12">
        <MessageCircle size={18} aria-hidden /> {c.contactCta}
      </AnchorButton>
    </div>
  );
}
