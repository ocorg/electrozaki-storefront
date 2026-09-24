"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, Copy, ImageOff, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { recordLandingView } from "./actions";

/** Counts one visit per page load (the page HTML itself is cached). */
export function ViewBeacon({ pageId }: { pageId: string }) {
  useEffect(() => {
    void recordLandingView(pageId);
  }, [pageId]);
  return null;
}

function remaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ endsAt }: { endsAt: string }) {
  const end = new Date(endsAt).getTime();
  const [now, setNow] = useState<number | null>(null);
  // Starts after mount: the server can't know the visitor's "now".
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (now === null) return <div className="h-14" aria-hidden />;
  const r = remaining(end - now);
  if (end - now <= 0) return <p className="text-sm font-semibold">Offre terminée</p>;
  const cell = (v: number, label: string) => (
    <div className="min-w-14 rounded-lg bg-black/25 px-2 py-1.5 text-center">
      <div className="text-xl font-bold tabular-nums">{String(v).padStart(2, "0")}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Temps restant">
      <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Se termine dans</span>
      <div className="flex gap-1.5">
        {r.d > 0 && cell(r.d, "jours")}
        {cell(r.h, "h")}
        {cell(r.m, "min")}
        {r.d === 0 && cell(r.s, "s")}
      </div>
    </div>
  );
}

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard refused: the code stays visible and selectable.
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-current px-3 py-1.5 font-mono text-lg font-bold tracking-widest"
      aria-label={`Copier le code ${code}`}
    >
      <span className="select-all">{code}</span>
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  );
}

type OfferProduct = { id: string; slug: string; name: string; brand: string | null; image: string | null; normal: number; price: number };

export function OfferProductCard({ product, landingId, accent }: { product: OfferProduct; landingId: string; accent: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const off = product.price < product.normal ? Math.round((1 - product.price / product.normal) * 100) : 0;

  function add() {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      image: product.image ?? undefined,
      landingId,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="relative aspect-square bg-neutral-50">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain p-3" sizes="(min-width: 768px) 25vw, 50vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">
            <ImageOff size={22} />
          </div>
        )}
        {off > 0 && (
          <span className="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: accent }}>
            -{off}%
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        {product.brand && <p className="text-xs uppercase tracking-wide text-neutral-500">{product.brand}</p>}
        <h3 className="line-clamp-2 min-h-[2.75em] text-sm font-medium leading-snug text-neutral-900">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-neutral-900">{formatMAD(product.price)}</span>
          {off > 0 && <span className="text-sm text-neutral-500 line-through">{formatMAD(product.normal)}</span>}
        </div>
        <button
          type="button"
          onClick={add}
          className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: accent }}
        >
          {added ? <Check size={16} /> : <ShoppingBag size={16} />}
          {added ? "Ajouté" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
