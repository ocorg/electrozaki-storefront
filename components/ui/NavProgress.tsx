"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// A thin bar across the top of the screen while a page is on its way, so a
// tap on a link, a filter or a search never looks ignored. Links report
// themselves (components/i18n/Link.tsx); code that navigates with the router
// reports through useNavPending().

let pendingCount = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Marks a navigation as in progress while `pending` is true. */
export function useNavPending(pending: boolean) {
  useEffect(() => {
    if (!pending) return;
    pendingCount++;
    emit();
    return () => {
      pendingCount--;
      emit();
    };
  }, [pending]);
}

export function NavProgress() {
  const busy = useSyncExternalStore(
    subscribe,
    () => pendingCount > 0,
    () => false
  );
  // A page that answers within 120 ms needs no bar; past that it runs, and
  // it fills and fades once the new page is there.
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  useEffect(() => {
    const t = busy
      ? setTimeout(() => setPhase("running"), 120)
      : setTimeout(() => setPhase((p) => (p === "running" ? "done" : p)), 0);
    return () => clearTimeout(t);
  }, [busy]);
  useEffect(() => {
    if (phase !== "done") return;
    const t = setTimeout(() => setPhase("idle"), 350);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 top-0 z-100 h-[3px] transition-opacity duration-300 ${phase === "idle" ? "opacity-0" : "opacity-100"}`}
    >
      <div className={`nav-progress h-full bg-gold ${phase === "done" ? "is-done" : phase === "running" ? "is-running" : ""}`} />
    </div>
  );
}
