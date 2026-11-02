"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";

// The phones aisle's model buttons. On a phone: one row that scrolls
// sideways. On a computer: the first row only, and a button for the rest
// (32 models in 5 rows used to push every phone below the screen).
const FIRST_ROW = 7;

export function ModelChips({ models }: { models: { slug: string; name: string }[] }) {
  const t = useT();
  const c = t.collection;
  const [open, setOpen] = useState(false);
  const more = models.length - FIRST_ROW;

  return (
    <nav aria-label={c.byModel} className="mt-4">
      <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{c.byModel}</p>
      <ul
        id="model-chips"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {models.map((m, i) => (
          <li key={m.slug} className={`flex-none ${!open && i >= FIRST_ROW ? "md:hidden" : ""}`}>
            <Link
              href={`/telephones/${m.slug}`}
              className="inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-[13px] font-semibold text-ink ring-1 ring-ink/10 transition-shadow hover:ring-ink/30"
            >
              {m.name}
            </Link>
          </li>
        ))}
        {more > 0 && (
          <li className="hidden flex-none md:block">
            <button
              type="button"
              aria-expanded={open}
              aria-controls="model-chips"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex min-h-10 items-center gap-1 rounded-full bg-ink px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-ink-3"
            >
              {open ? c.fewerModels : c.moreModels(more)}
              <ChevronDown size={15} aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
