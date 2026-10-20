"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Hand, Palette, X } from "lucide-react";
import type { WidgetsText } from "@/lib/guides/widgets";

// Guide 1: test a phone's screen from the page itself, on the phone being
// checked. Colours: full-screen plain colours, a tap for the next one (dead
// pixels, spots, burn-in). Touch: a grid that turns gold where the finger
// passes (dead zones). Full screen when the browser allows it.

const COLORS = ["#ffffff", "#000000", "#808080", "#ff0000", "#00ff00", "#0000ff"];
const COLS = 8;

export function ScreenTest({ t }: { t: WidgetsText["screenTest"] }) {
  const id = useId();
  const [mode, setMode] = useState<"colors" | "touch" | null>(null);
  const [color, setColor] = useState(0);
  const [rows, setRows] = useState(14);
  const [touched, setTouched] = useState<Set<number>>(new Set());
  const layer = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setMode(null);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    opener.current?.focus();
  }, []);

  useEffect(() => {
    if (!mode) return;
    document.documentElement.style.overflow = "hidden";
    layer.current?.requestFullscreen?.().catch(() => {});
    layer.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [mode, close]);

  function start(next: "colors" | "touch", button: HTMLButtonElement) {
    opener.current = button;
    setColor(0);
    setTouched(new Set());
    setRows(Math.max(10, Math.round((window.innerHeight / window.innerWidth) * COLS)));
    setMode(next);
  }

  function touchAt(x: number, y: number) {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = el?.dataset.cell;
    if (cell === undefined) return;
    const n = Number(cell);
    setTouched((prev) => (prev.has(n) ? prev : new Set(prev).add(n)));
  }

  const total = COLS * rows;
  const allTouched = touched.size >= total;

  return (
    <section aria-labelledby={`${id}-t`} className="my-10 rounded-4xl bg-ink p-5 text-white sm:p-8">
      <h2 id={`${id}-t`} className="font-display text-2xl font-bold text-gold">
        {t.title}
      </h2>
      <p className="mt-2 text-neutral-300">{t.text}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={(e) => start("colors", e.currentTarget)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-5 font-semibold text-ink hover:bg-gold-bright"
        >
          <Palette size={18} aria-hidden /> {t.colors}
        </button>
        <button
          type="button"
          onClick={(e) => start("touch", e.currentTarget)}
          className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 font-semibold text-white hover:border-gold"
        >
          <Hand size={18} aria-hidden /> {t.touch}
        </button>
      </div>

      {mode && (
        <div
          ref={layer}
          role="dialog"
          aria-modal="true"
          aria-label={mode === "colors" ? t.colors : t.touch}
          tabIndex={-1}
          className="fixed inset-0 z-[200] select-none outline-none"
          style={{ background: mode === "colors" ? COLORS[color] : "#111013", touchAction: "none" }}
          onClick={mode === "colors" ? () => setColor((c) => (c + 1) % COLORS.length) : undefined}
          onPointerDown={mode === "touch" ? (e) => touchAt(e.clientX, e.clientY) : undefined}
          onPointerMove={mode === "touch" ? (e) => (e.buttons || e.pointerType === "touch") && touchAt(e.clientX, e.clientY) : undefined}
        >
          {mode === "touch" && (
            <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}>
              {Array.from({ length: total }, (_, n) => (
                <div key={n} data-cell={n} className={`border border-white/10 ${touched.has(n) ? "bg-gold" : ""}`} />
              ))}
            </div>
          )}
          {/* the hint only until the first change, so it doesn't hide pixels */}
          {((mode === "colors" && color === 0) || (mode === "touch" && touched.size === 0) || allTouched) && (
            <p className="pointer-events-none absolute inset-x-6 top-1/2 -translate-y-1/2 rounded-2xl bg-ink/85 px-5 py-4 text-center font-semibold text-white">
              {allTouched ? t.touchDone : mode === "colors" ? t.colorsHint : t.touchHint}
            </p>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute end-3 top-[max(0.75rem,env(safe-area-inset-top))] inline-flex min-h-11 items-center gap-1.5 rounded-full bg-ink/70 px-4 text-sm font-semibold text-white"
          >
            <X size={16} aria-hidden /> {t.exit}
          </button>
        </div>
      )}
    </section>
  );
}
