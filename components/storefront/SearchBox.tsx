"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ImageOff, Loader2, Search, X } from "lucide-react";
import { formatMAD } from "@/lib/format";
import { CONDITION_LABEL } from "@/lib/conditions";
import type { SearchSuggestion } from "@/lib/db/public-products";

// Header search with live product suggestions as the customer types; Enter
// (or "Voir les N résultats") opens the full results page.
export function SearchBox({ className = "", placeholder = "Rechercher un téléphone, un accessoire..." }: {
  className?: string;
  placeholder?: string;
}) {
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
    router.push(`/search?q=${encodeURIComponent(query)}`);
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
        router.push(`/products/${items[active].slug}`);
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
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            maxLength={60}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            className="min-h-11 w-full rounded-l-lg border border-r-0 border-black/15 bg-white pl-3 pr-9 text-sm focus:border-gold focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button
              type="button"
              aria-label="Effacer"
              onClick={() => {
                setQ("");
                setItems([]);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="Rechercher"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-r-lg border border-black/15 bg-ink text-white transition-colors hover:bg-neutral-800"
        >
          <Search size={18} />
        </button>
      </form>

      {showPanel && (
        <div
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[70vh] overflow-y-auto rounded-xl border border-black/10 bg-white shadow-xl sm:min-w-[22rem]"
        >
          {loading && items.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-4 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" /> Recherche…
            </p>
          ) : items.length === 0 ? (
            <div className="px-4 py-4 text-sm text-neutral-600">
              Aucun produit pour « {query} ».{" "}
              <a href="https://wa.me/212667654430" className="font-semibold text-ink underline decoration-[#25D366] decoration-2 underline-offset-2">
                Demandez-nous sur WhatsApp
              </a>
              .
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/5">
                {items.map((p, i) => (
                  <li key={p.slug} role="option" aria-selected={i === active}>
                    <Link
                      href={`/products/${p.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex items-center gap-3 px-3 py-2.5 transition-colors ${i === active ? "bg-gold/10" : "hover:bg-neutral-50"}`}
                    >
                      <span className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-50">
                        {p.image ? (
                          <Image src={p.image} alt="" fill sizes="56px" className="object-contain p-1" />
                        ) : (
                          <ImageOff size={18} className="text-neutral-300" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        {p.brand && <span className="block text-[11px] uppercase tracking-wide text-neutral-500">{p.brand}</span>}
                        <span className="block text-sm font-medium leading-snug text-neutral-900 line-clamp-2">{p.name}</span>
                        {p.isPhone && <span className="text-xs text-neutral-500">{CONDITION_LABEL[p.condition] ?? p.condition}</span>}
                      </span>
                      <span className="flex-shrink-0 text-right">
                        {p.fromPrice && <span className="block text-[11px] text-neutral-500">dès</span>}
                        <span className="block text-sm font-bold text-ink">{formatMAD(p.price)}</span>
                        {p.compareAtPrice && <span className="block text-xs text-neutral-400 line-through">{formatMAD(p.compareAtPrice)}</span>}
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
                {total > items.length ? `Voir les ${total} résultats` : "Voir les résultats"} →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
