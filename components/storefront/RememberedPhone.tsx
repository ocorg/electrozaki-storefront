"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import Link from "@/components/i18n/Link";
import { useT } from "@/components/i18n/I18nProvider";
import { MODEL_GROUP } from "@/lib/facets";

// The phone a visitor picked in an aisle's guide is kept in this browser
// (nothing is sent anywhere), so the next visit and the product pages can
// say "fits your iPhone 13" without asking again.
const KEY = "ez_phone";

type Phone = { key: string; name: string };

function stored(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null; // storage blocked: nothing remembered
  }
}

function onChange(notify: () => void) {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
}

// Nothing on the server and on the first browser render (the page's HTML is
// shared by every visitor), then this browser's phone.
function useRememberedPhone(): Phone | null {
  const raw = useSyncExternalStore(onChange, stored, () => null);
  return useMemo(() => {
    try {
      const saved = JSON.parse(raw ?? "null");
      return saved && typeof saved.key === "string" && typeof saved.name === "string" ? { key: saved.key, name: saved.name } : null;
    } catch {
      return null;
    }
  }, [raw]);
}

/**
 * In the guide. Remembers the phone that is picked; when none is picked but
 * one was on an earlier visit, offers it back as a one-tap shortcut.
 * `hrefs` maps a model's key to the address that picks it.
 */
export function RememberedPhone({ picked, hrefs }: { picked: Phone | null; hrefs: Record<string, string> }) {
  const t = useT();
  const remembered = useRememberedPhone();

  useEffect(() => {
    if (!picked) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(picked));
    } catch {
      // private browsing: the guide still works, it just won't remember
    }
  }, [picked]);

  if (picked || !remembered || !hrefs[remembered.key]) return null;
  return (
    <Link
      href={hrefs[remembered.key]}
      scroll={false}
      className="mx-5 mb-4 flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-gold px-4 py-2.5 text-ink transition-[filter] hover:brightness-105 sm:mx-7"
    >
      <span className="text-sm font-bold">{t.guide.remembered(remembered.name)}</span>
      <span className="inline-flex flex-none items-center gap-1.5 text-[13px] font-semibold">
        {t.guide.seeFitting} <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
      </span>
    </Link>
  );
}

/**
 * On a product page: does this accessory fit the phone the visitor told us
 * about? Says nothing when they never picked one, or when the product has
 * no model ticked (unknown is not "no").
 */
export function FitsYourPhone({ fits, aisleHref }: { fits: Phone[]; aisleHref: string }) {
  const t = useT();
  const phone = useRememberedPhone();
  if (!phone || fits.length === 0) return null;

  if (fits.some((f) => f.key === phone.key)) {
    return (
      <p className="mt-4 flex items-center gap-2.5 rounded-2xl bg-signal/10 px-4 py-3 text-sm font-bold text-signal ring-1 ring-signal/25">
        <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-signal text-white">
          <Check size={14} strokeWidth={3} aria-hidden />
        </span>
        {t.guide.fitsYours(phone.name)}
      </p>
    );
  }
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 ring-1 ring-amber-200">
      <Info size={17} aria-hidden className="flex-none" />
      <span className="min-w-0 flex-1">{t.guide.notYours(phone.name)}</span>
      <Link href={`${aisleHref}?${MODEL_GROUP}=${encodeURIComponent(phone.key)}`} className="underline underline-offset-2">
        {t.guide.seeFitting}
      </Link>
    </p>
  );
}
