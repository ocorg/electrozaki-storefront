"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "@/components/i18n/Link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageOff, Loader2, Search, X } from "lucide-react";
import { formatMAD } from "@/lib/format";
import { useLocalePath, useT } from "@/components/i18n/I18nProvider";
import type { SearchSuggestion } from "@/lib/db/public-products";
import { WHATSAPP_URL } from "@/lib/site";

// Header search with live product suggestions as the customer types; Enter
// (or "Voir les N résultats") opens the full results page.
export function SearchBox({ className = "", placeholder }: {
  className?: string;
  placeholder?: string;
}) {
  const t = useT();
  const s = t.searchBox;
  const withLocale = useLocalePath();
  const router = useRouter();
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchSuggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(-1);

  const query = q.trim();

  // Suggestions, 250 ms after the last key
  useEffect(() => {
    if (query.length < 2) return; // the panel only shows from 2 characters
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = (await r.json()) as { items: SearchSuggestion[]; total: number };
        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setActive(-1);
      } catch {
        /* aborted or offline: keep the last suggestions */
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query]);

  // Close when tapping elsewhere
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  function goToResults() {
    if (!query) return;
    setOpen(false);
    router.push(withLocale(`/search?q=${encodeURIComponent(query)}`));
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(items.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && items[active]) {
        setOpen(false);
        router.push(withLocale(`/products/${items[active].slug}`));
      } else goToResults();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showPanel = open && query.length >= 2;

  return (
    <div ref={box} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          goToResults();
        }}
        className="flex"
      >
        <div className="relative flex-1">
          <input
            type="search"
            name="q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder ?? t.common.searchPlaceholder}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={60}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={s.label}
            aria-activedescendant={showPanel && active >= 0 && items[active] ? `${listId}-${active}` : undefined}
            className="min-h-11 w-full rounded-s-full border border-e-0 border-ink/15 bg-white ps-4 pe-9 text-[15px] text-ink placeholder:text-neutral-500 sm:text-sm focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              aria-label={s.clear}
              onClick={() => {
                setQ("");
                setItems([]);
              }}
              className="absolute inset-e-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label={s.submit}
          className="flex min-h-11 min-w-12 items-center justify-center rounded-e-full border border-ink bg-ink pe-1 text-white transition-colors hover:bg-ink-3"
        >
          <Search size={18} />
        </button>
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-e-0 top-full z-50 mt-1.5 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-ink/10 bg-white shadow-[0_30px_60px_-25px_rgb(17_16_19/0.45)] sm:w-[24rem]"
        >
          {loading && items.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-4 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" /> {s.loading}
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-4 text-sm text-neutral-600">
              {s.noneBefore(query)}{" "}
              <a href={WHATSAPP_URL} className="font-semibold text-ink underline decoration-whatsapp decoration-2 underline-offset-2">
                {s.askWhatsapp}
              </a>
              .
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/5">
                {items.map((p, i) => (
                  <li key={p.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${i === active ? "bg-gold/10" : "hover:bg-neutral-50"}`}
                    >
                      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50">
                        {p.image ? (
                          <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1" />
                        ) : (
                          <ImageOff size={18} className="text-neutral-300" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        {p.brand && <span className="block text-[11px] uppercase tracking-wide text-neutral-500">{p.brand}</span>}
                        <span className="block text-sm font-medium leading-snug text-neutral-900 line-clamp-2">{p.name}</span>
                        {p.isPhone && <span className="text-xs text-neutral-500">{t.grades.label[p.condition] ?? p.condition}</span>}
                      </span>
                      <span className="shrink-0 text-end">
                        {p.fromPrice && <span className="block text-[11px] text-neutral-500">{t.common.from}</span>}
                        <span className="block text-sm font-bold text-ink">{formatMAD(p.price)}</span>
                        {p.compareAtPrice && <span className="block text-xs text-neutral-500 line-through">{formatMAD(p.compareAtPrice)}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={goToResults}
                className="w-full border-t border-black/10 px-4 py-3 text-sm font-semibold text-ink hover:bg-neutral-50"
              >
                {total > items.length ? s.seeAll : s.see} <span className="inline-block rtl:rotate-180">→</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
