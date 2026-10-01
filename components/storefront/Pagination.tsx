import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "@/components/i18n/Link";
import { getT } from "@/lib/i18n/server";

// Numbered pages for a catalogue (plain links: crawlable, work without JS).
// Keeps every other query parameter (filters, sort) in the links.
export async function Pagination({
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
  const t = await getT();

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
  // Arrows point the way pages read: mirrored in right-to-left languages.
  const flip = "rtl:rotate-180";

  return (
    <nav aria-label={t.pagination.aria} className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" aria-label={t.pagination.previous} className={`${box} bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30`}>
          <ChevronLeft size={18} className={flip} />
        </Link>
      ) : (
        <span className={`${box} text-neutral-400`} aria-hidden>
          <ChevronLeft size={18} className={flip} />
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
            aria-label={t.pagination.page(p)}
            className={`${box} readout ${p === page ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30"}`}
          >
            {p}
          </Link>
        )
      )}
      {page < pageCount ? (
        <Link href={href(page + 1)} rel="next" aria-label={t.pagination.next} className={`${box} bg-white text-ink ring-1 ring-ink/10 hover:ring-ink/30`}>
          <ChevronRight size={18} className={flip} />
        </Link>
      ) : (
        <span className={`${box} text-neutral-400`} aria-hidden>
          <ChevronRight size={18} className={flip} />
        </span>
      )}
    </nav>
  );
}
