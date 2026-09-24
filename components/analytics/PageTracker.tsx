"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "./track";

// One "view" per page shown. The first page of a visit also reports how long
// it took to load completely (from the browser's own navigation timing).
export function PageTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (last.current === pathname) return; // React may run effects twice
    const first = last.current === null;
    last.current = pathname;
    if (!first) {
      track({ t: "view" });
      return;
    }

    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const loadMs = nav && nav.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : undefined;
      track({ t: "view", l: loadMs });
    };
    // Wait for the load to finish to measure it; still count the view if
    // the visitor leaves before that.
    if (document.readyState === "complete") setTimeout(send, 0);
    else window.addEventListener("load", () => setTimeout(send, 0), { once: true });
    window.addEventListener("pagehide", send, { once: true });
    const timer = setTimeout(send, 15_000);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
