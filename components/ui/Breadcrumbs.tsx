import { ChevronRight } from "lucide-react";
import Link from "@/components/i18n/Link";
import { JsonLd, breadcrumbJsonLd } from "@/lib/json-ld";
import { getLocale, getT } from "@/lib/i18n/server";

// Visible trail + the matching BreadcrumbList structured data. The last
// item is the current page (not a link). `path`s are unprefixed
// ("/collections/x"); links and structured data get the page's language.
export async function Breadcrumbs({
  items,
  tone = "light",
  className = "",
}: {
  items: { name: string; path: string }[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const [t, locale] = await Promise.all([getT(), getLocale()]);
  const dark = tone === "dark";
  return (
    <nav aria-label={t.breadcrumbs.aria} className={className}>
      <JsonLd data={breadcrumbJsonLd(locale, items)} />
      <ol className={`flex flex-wrap items-center gap-1 text-sm ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className={`font-semibold ${dark ? "text-white" : "text-ink"} line-clamp-1`}>
                  {it.name}
                </span>
              ) : (
                <>
                  <Link href={it.path} className={`underline-offset-4 hover:underline ${dark ? "hover:text-white" : "hover:text-ink"}`}>
                    {it.name}
                  </Link>
                  <ChevronRight size={14} aria-hidden className="text-neutral-400 rtl:rotate-180" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
