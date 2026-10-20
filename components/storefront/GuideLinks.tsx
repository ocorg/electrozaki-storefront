import { BookOpen } from "lucide-react";
import Link from "@/components/i18n/Link";
import type { Locale } from "@/lib/i18n/config";
import { GUIDE_SLUGS, guidesText, type GuideSlug } from "@/lib/guides";

// The buying guides, as a short list of links (product, model and guide
// pages): the answers to what people ask before buying a used phone.
export function GuideLinks({ locale, except, title }: { locale: Locale; except?: GuideSlug; title?: string }) {
  const g = guidesText(locale);
  const slugs = GUIDE_SLUGS.filter((s) => s !== except);
  return (
    <nav aria-label={title ?? g.indexTitle} className="rounded-3xl bg-white p-5 ring-1 ring-ink/7 sm:p-6">
      <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">
        <BookOpen size={16} aria-hidden /> {title ?? g.indexTitle}
      </p>
      <ul className="mt-3 divide-y divide-ink/7">
        {slugs.map((slug) => (
          <li key={slug}>
            <Link href={`/guides/${slug}`} className="flex min-h-12 items-center justify-between gap-3 py-2.5 font-semibold text-ink hover:text-gold-deep">
              {g.guides[slug].title}
              <span aria-hidden className="text-neutral-400 rtl:rotate-180">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
