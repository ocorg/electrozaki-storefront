"use client";

import { useEffect, useId, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, OctagonX, RotateCcw } from "lucide-react";
import type { WidgetsText } from "@/lib/guides/widgets";

// Guide 1: the 10 checks as a list to mark while holding the phone. A
// problem on a deal-breaker (iCloud, IMEI) says "don't buy"; on another
// point, "ask or negotiate". Kept in this browser only (a convenience).

type Mark = "ok" | "problem" | null;

export function Checklist({
  items,
  critical,
  t,
  storageKey,
}: {
  items: string[];
  critical: number[];
  t: WidgetsText["checklist"];
  storageKey: string;
}) {
  const id = useId();
  const [marks, setMarks] = useState<Mark[]>(() => items.map(() => null));
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      // after the first paint, so the page matches the server's at first
      if (Array.isArray(saved) && saved.length === items.length) queueMicrotask(() => setMarks(saved));
    } catch {
      // private window or blocked storage: start empty
    }
  }, [storageKey, items.length]);
  const save = (next: Mark[]) => {
    setMarks(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // not kept, still works
    }
  };
  const mark = (i: number, m: Mark) => save(marks.map((x, j) => (j === i ? (x === m ? null : m) : x)));

  const done = marks.filter(Boolean).length;
  const blocking = marks.some((m, i) => m === "problem" && critical.includes(i));
  const problems = marks.some((m) => m === "problem");
  const fill = (s: string) => s.replace("{n}", String(done)).replace("{total}", String(items.length));
  const ring = 2 * Math.PI * 22;

  return (
    <section aria-labelledby={`${id}-t`} className="my-10 rounded-4xl bg-white p-5 ring-1 ring-ink/7 sm:p-8">
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 52 52" className="h-14 w-14 flex-none -rotate-90" aria-hidden>
          <circle cx="26" cy="26" r="22" fill="none" stroke="currentColor" strokeWidth="5" className="text-ink/10" />
          <circle
            cx="26"
            cy="26"
            r="22"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            stroke="currentColor"
            className={`${blocking ? "text-red-600" : "text-gold"} transition-[stroke-dashoffset] duration-300`}
            strokeDasharray={ring}
            strokeDashoffset={ring * (1 - done / items.length)}
          />
        </svg>
        <div>
          <h2 id={`${id}-t`} className="font-display text-2xl font-bold text-ink">
            {t.title}
          </h2>
          <p className="readout text-sm font-semibold text-neutral-600" aria-live="polite">
            {fill(t.progress)}
          </p>
        </div>
      </div>
      <p className="mt-3 text-neutral-700">{t.intro}</p>

      <ol className="mt-5 divide-y divide-ink/7">
        {items.map((item, i) => (
          <li key={item} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <a href={`#etape-${i + 1}`} className="min-w-0 flex-1 font-semibold text-ink hover:text-gold-deep">
              <span className="readout me-2 text-neutral-400">{i + 1}.</span>
              {item}
            </a>
            <span className="flex gap-2">
              <button
                type="button"
                aria-pressed={marks[i] === "ok"}
                onClick={() => mark(i, "ok")}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ring-1 transition-colors ${
                  marks[i] === "ok" ? "bg-signal text-white ring-signal" : "bg-white text-neutral-700 ring-ink/15 hover:ring-ink/40"
                }`}
              >
                <Check size={15} aria-hidden /> {t.ok}
              </button>
              <button
                type="button"
                aria-pressed={marks[i] === "problem"}
                onClick={() => mark(i, "problem")}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold ring-1 transition-colors ${
                  marks[i] === "problem" ? "bg-red-600 text-white ring-red-600" : "bg-white text-neutral-700 ring-ink/15 hover:ring-ink/40"
                }`}
              >
                <AlertTriangle size={15} aria-hidden /> {t.problem}
              </button>
            </span>
          </li>
        ))}
      </ol>

      <div aria-live="polite">
        {blocking ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-800 ring-1 ring-red-200">
            <OctagonX size={20} aria-hidden className="mt-0.5 flex-none" /> {t.stop}
          </p>
        ) : problems ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 font-semibold text-amber-900 ring-1 ring-amber-200">
            <AlertTriangle size={20} aria-hidden className="mt-0.5 flex-none" /> {t.negotiate}
          </p>
        ) : done === items.length ? (
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-green-50 px-4 py-3 font-semibold text-green-800 ring-1 ring-green-200">
            <CheckCircle2 size={20} aria-hidden className="mt-0.5 flex-none" /> {fill(t.allGood)}
          </p>
        ) : null}
      </div>

      {done > 0 && (
        <button
          type="button"
          onClick={() => save(items.map(() => null))}
          className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-neutral-600 underline-offset-4 hover:text-ink hover:underline"
        >
          <RotateCcw size={15} aria-hidden /> {t.reset}
        </button>
      )}
    </section>
  );
}
