"use client";

import { useEffect, useRef } from "react";
import { track } from "./track";

// What visitors search for, and whether anything was found — searches with
// no result show the ERP what customers want and the shop doesn't have.
export function SearchTracker({ query, results }: { query: string; results: number }) {
  const sent = useRef<string | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (!q || sent.current === q) return;
    sent.current = q;
    track({ t: "search", q, r: results });
  }, [query, results]);
  return null;
}
