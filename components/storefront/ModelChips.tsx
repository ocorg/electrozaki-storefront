"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";

// The phones aisle's model buttons: every model on one row (by brand, then
// newest), swiped on a phone, slid with the arrows on a computer. Brand
// buttons above jump to that brand's first model and light up as the row
// moves. Nothing moves on its own: the customer stays in control.

type Model = { slug: string; name: string; brandKey: string };

// Room left at the start of the row after a jump: the arrow's width on a
// computer (arrows show from the md breakpoint), the page margin on a phone.
function gapAtStart(): number {
  return window.matchMedia("(min-width: 768px)").matches ? 44 : 16;
}

// Brands with their own button; the rest share "Autres".
const OWN_TAB: Record<string, string> = { apple: "iPhone", samsung: "Samsung", xiaomi: "Xiaomi" };
const OTHERS = "others";

export function ModelChips({ models }: { models: Model[] }) {
  const t = useT();
  const c = t.collection;
  const rowRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [active, setActive] = useState<string | null>(null);

  const tabOf = (m: Model) => (OWN_TAB[m.brandKey.toLowerCase()] ? m.brandKey.toLowerCase() : OTHERS);
  // Each brand button and the index of its first model in the row.
  const tabs = useMemo(() => {
    const out: { key: string; label: string; first: number }[] = [];
    models.forEach((m, i) => {
      const key = tabOf(m);
      if (!out.some((x) => x.key === key)) out.push({ key, label: OWN_TAB[key] ?? c.otherBrands, first: i });
    });
    return out;
  }, [models, c.otherBrands]);

  // Which edges hide more models (for the arrows and fades), and which
  // brand is at the start of the row. Works right-to-left too (Arabic).
  const update = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const rtl = getComputedStyle(row).direction === "rtl";
    const fromLeft = rtl ? row.scrollLeft + max : row.scrollLeft;
    setEdges({ left: fromLeft > 2, right: fromLeft < max - 2 });

    const box = row.getBoundingClientRect();
    const chips = row.children;
    let current = tabs[0]?.key ?? null;
    for (const tab of tabs) {
      const r = (chips[tab.first] as HTMLElement | undefined)?.getBoundingClientRect();
      if (!r) continue;
      const gap = gapAtStart() + 24;
      const passed = rtl ? box.right - r.right <= gap : r.left - box.left <= gap;
      // At the end of the row, a brand already in view counts as reached.
      const atEnd = fromLeft >= max - 2 && (rtl ? r.left >= box.left : r.right <= box.right);
      if (passed || atEnd) current = tab.key;
    }
    setActive(current);
  }, [tabs]);

  useEffect(() => {
    update();
    const row = rowRef.current;
    if (!row) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    row.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  function slide(dir: -1 | 1) {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  }

  function jump(first: number) {
    const row = rowRef.current;
    const chip = row?.children[first] as HTMLElement | undefined;
    if (!row || !chip) return;
    const box = row.getBoundingClientRect();
    const r = chip.getBoundingClientRect();
    const rtl = getComputedStyle(row).direction === "rtl";
    // Brings the brand's first model to the start of the row (clear of the
    // arrow on a computer), without moving the page up or down.
    const gap = gapAtStart();
    row.scrollBy({ left: rtl ? r.right - box.right + gap : r.left - box.left - gap, behavior: "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-[0_4px_14px_-4px_rgb(17_16_19/0.35)] ring-1 ring-ink/10 transition-opacity hover:ring-ink/30 md:flex";

  return (
    <nav aria-label={c.byModel} className="mt-4">
      <div className="mb-2.5 flex items-center gap-3">
        <p className="hidden font-mono text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600 sm:block">{c.byModel}</p>
        {tabs.length > 1 && (
          <div role="group" aria-label={c.brandJump} className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => {
              const on = tab.key === active;
              return (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={on}
                  onClick={() => jump(tab.first)}
                  className={`min-h-8 rounded-full px-3 text-[13px] font-semibold transition-colors ${
                    on ? "bg-ink text-white" : "bg-ink/6 text-neutral-700 hover:bg-ink/10"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="relative -mx-4 md:mx-0">
        {/* Fades say "there's more this way"; the arrows (computer) slide the row. */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-[5] w-10 bg-gradient-to-r from-paper-2 to-transparent transition-opacity ${edges.left ? "opacity-100" : "opacity-0"}`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-[5] w-10 bg-gradient-to-l from-paper-2 to-transparent transition-opacity ${edges.right ? "opacity-100" : "opacity-0"}`}
        />
        <button
          type="button"
          aria-label={c.modelsPrev}
          onClick={() => slide(-1)}
          tabIndex={edges.left ? 0 : -1}
          className={`${arrow} -left-2 ${edges.left ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <button
          type="button"
          aria-label={c.modelsNext}
          onClick={() => slide(1)}
          tabIndex={edges.right ? 0 : -1}
          className={`${arrow} -right-2 ${edges.right ? "opacity-100" : "pointer-events-none opacity-0"}`}
        >
          <ChevronRight size={18} aria-hidden />
        </button>

        <ul ref={rowRef} className="flex gap-2 overflow-x-auto px-4 py-1 scrollbar-none md:px-1 [&::-webkit-scrollbar]:hidden">
          {models.map((m) => (
            <li key={m.slug} className="flex-none">
              <Link
                href={`/telephones/${m.slug}`}
                className="inline-flex min-h-10 items-center rounded-full bg-white px-3.5 text-[13px] font-semibold text-ink ring-1 ring-ink/10 transition-shadow hover:ring-ink/30"
              >
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
