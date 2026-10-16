"use client";

import { useEffect, useRef } from "react";
import { track } from "./track";

// What visitors search for, and whether anything was found — searches with
// no result show the ERP what customers want and the shop doesn't have.
// Aisles search as you type, so a query is only counted once the visitor
// has stopped on it ("13", not "1" then "13").
export function SearchTracker({ query, results }: { query: string; results: number }) {
  const sent = useRef<string | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (!q || sent.current === q) return;
    const timer = setTimeout(() => {
      sent.current = q;
      track({ t: "search", q, r: results });
    }, 2000);
    return () => clearTimeout(timer);
  }, [query, results]);
  return null;
}
