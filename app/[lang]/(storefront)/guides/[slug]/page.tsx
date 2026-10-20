import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { AnchorButton } from "@/components/ui/Button";
import { GuideLinks } from "@/components/storefront/GuideLinks";
import { GuideText } from "@/components/storefront/GuideText";
import { getLocale, getT } from "@/lib/i18n/server";
import { LOCALE_META, localePath } from "@/lib/i18n/config";
import { alternates } from "@/lib/i18n/seo";
import { JsonLd } from "@/lib/json-ld";
import { formatMAD } from "@/lib/format";
import { absoluteUrl, SITE_URL, WHATSAPP_URL } from "@/lib/site";
import { GUIDE_SLUGS, guidesText, isGuideSlug } from "@/lib/guides";
import { getModelPage } from "@/lib/offers/phone-offers";

// A buying guide (/guides/<slug>). Text in lib/guides; guide 2's price
// example comes from live stock. Cached an hour, refreshed by the ERP.
export const revalidate = 3600;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

const PUBLISHED = "2026-10-20";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isGuideSlug(slug)) return {};
  const locale = await getLocale();
  const guide = guidesText(locale).guides[slug];
  const alt = alternates(locale, `/guides/${slug}`);
  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: alt,
    openGraph: { type: "article", title: `${guide.metaTitle} | Electro Zaki`, description: guide.metaDescription, url: alt.canonical },
  };
}

/** "un iPhone 13 est à partir de 2 700 DH en Pièces remplacées, contre 3 100 DH…", from stock; "" when not both in stock. */
async function priceExample(example: (model: string, replaced: string, original: string) => string): Promise<string> {
  const page = await getModelPage("iphone-13");
  if (!page) return "";
  const lowest = (grade: string) => {
    const prices = page.units.filter((u) => u.grade === grade).map((u) => u.price);
    return prices.length ? Math.min(...prices) : null;
  };
  const replaced = lowest("PIECES_REMPLACEES");
  const original = lowest("TRES_BON");
  return replaced !== null && original !== null && replaced < original ? example(page.name, formatMAD(replaced), formatMAD(original)) : "";
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  if (!isGuideSlug(slug)) notFound();
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const g = guidesText(locale);
  const guide = g.guides[slug];
  const prices = slug === "pieces-origine-ou-remplacees" ? await priceExample(g.priceExample) : "";
  const fill = (s: string) => s.replace(/\s*\{prices\}\s*/, prices ? ` ${prices} ` : " ");

  const url = absoluteUrl(localePath(locale, `/guides/${slug}`));
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    inLanguage: LOCALE_META[locale].htmlLang,
    url,
    mainEntityOfPage: url,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    image: absoluteUrl("/opengraph-image"),
    author: { "@type": "Organization", name: "Electro Zaki", url: SITE_URL },
    publisher: { "@id": `${SITE_URL}/#store` },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-8">
      <JsonLd data={article} />
      <Breadcrumbs
        items={[
          { name: t.common.home, path: "/" },
          { name: g.indexTitle, path: "/guides" },
          { name: guide.title, path: `/guides/${slug}` },
        ]}
      />
      <article className="mt-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{g.eyebrow}</p>
        <h1 className="font-display mt-3 text-[2.1rem] font-extrabold leading-[1.05] text-ink sm:text-5xl">{guide.title}</h1>
        <p className="mt-2 text-sm text-neutral-500">{g.updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-neutral-700">{guide.intro}</p>

        <div className="mt-8 space-y-8">
          {guide.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-display text-2xl font-bold text-ink">{section.title}</h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-neutral-800">
                  <GuideText text={fill(p)} />
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 leading-relaxed text-neutral-800">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full bg-gold" />
                      <span>
                        <GuideText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {section.after?.map((p, i) => (
                <p key={i} className="mt-3 leading-relaxed text-neutral-800">
                  <GuideText text={fill(p)} />
                </p>
              ))}
            </section>
          ))}
        </div>

        <aside className="mt-10 rounded-3xl bg-ink p-6 text-white sm:p-8">
          <h2 className="font-display text-2xl font-bold text-gold">{guide.shopTitle}</h2>
          <p className="mt-3 leading-relaxed text-neutral-200">{guide.shop}</p>
          <AnchorButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="whatsapp" className="mt-6">
            <MessageCircle size={18} aria-hidden /> {t.repairPage.chatWhatsapp}
          </AnchorButton>
        </aside>
      </article>

      <div className="mt-10">
        <GuideLinks locale={locale} except={slug} title={g.others} />
      </div>
    </div>
  );
}
