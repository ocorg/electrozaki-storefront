import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd, breadcrumbJsonLd } from "@/lib/json-ld";

// Visible trail + the matching BreadcrumbList structured data. The last
// item is the current page (not a link).
export function Breadcrumbs({
  items,
  tone = "light",
  className = "",
}: {
  items: { name: string; path: string }[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <JsonLd data={breadcrumbJsonLd(items)} />
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
                  <ChevronRight size={14} aria-hidden className="text-neutral-400" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
