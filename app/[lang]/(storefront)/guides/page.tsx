import type { Metadata } from "next";
import Link from "@/components/i18n/Link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";
import { GUIDE_SLUGS, guidesText } from "@/lib/guides";

// The buying guides, listed (/guides).
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const g = guidesText(locale);
  const alt = alternates(locale, "/guides");
  return {
    title: g.indexMetaTitle,
    description: g.indexMetaDescription,
    alternates: alt,
    openGraph: { title: `${g.indexMetaTitle} | Electro Zaki`, description: g.indexMetaDescription, url: alt.canonical },
  };
}

export default async function GuidesPage() {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const g = guidesText(locale);
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:pt-8">
      <Breadcrumbs
        items={[
          { name: t.common.home, path: "/" },
          { name: g.indexTitle, path: "/guides" },
        ]}
      />
      <h1 className="font-display mt-6 text-[2.3rem] font-extrabold leading-none text-ink sm:text-6xl">{g.indexTitle}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-600">{g.indexIntro}</p>
      <ul className="mt-10 grid gap-4 md:grid-cols-3">
        {GUIDE_SLUGS.map((slug) => {
          const guide = g.guides[slug];
          return (
            <li key={slug}>
              <Link
                href={`/guides/${slug}`}
                className="group flex h-full flex-col rounded-3xl bg-white p-6 ring-1 ring-ink/7 transition-shadow hover:ring-ink/20"
              >
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">{g.eyebrow}</span>
                <span className="font-display mt-3 text-xl font-bold leading-snug text-ink">{guide.title}</span>
                <span className="mt-3 text-[15px] leading-relaxed text-neutral-600">{guide.metaDescription}</span>
                <span className="mt-auto pt-5 text-sm font-semibold text-ink underline-offset-4 group-hover:underline">
                  {g.read} <span aria-hidden className="inline-block rtl:rotate-180">→</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
