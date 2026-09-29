import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Numbered pages for a catalogue (plain links: crawlable, work without JS).
// Keeps every other query parameter (filters, sort) in the links.
export function Pagination({
  page,
  pageCount,
  basePath,
  params,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (pageCount <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== "page") q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  // 1 … 4 5 6 … 12
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= pageCount; p++) {
    if (p === 1 || p === pageCount || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  const box = "flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Pages" className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Page précédente" className={`${box} bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30`}>
          <ChevronLeft size={18} />
        </Link>
      ) : (
        <span className={`${box} text-neutral-400`} aria-hidden>
          <ChevronLeft size={18} />
        </span>
      )}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-neutral-500" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`${box} readout ${p === page ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"}`}
          >
            {p}
          </Link>
        )
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" aria-label="Page suivante" className={`${box} bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30`}>
          <ChevronRight size={18} />
        </Link>
      ) : (
        <span className={`${box} text-neutral-400`} aria-hidden>
          <ChevronRight size={18} />
        </span>
      )}
    </nav>
  );
}
