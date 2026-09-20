"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Fades a section in the first time it scrolls into view, then disconnects —
// no replay jank scrolling back up. Pure CSS transition (see .reveal in
// globals.css); this component only toggles the class at the right time.
export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Must start false on both server and client — the server has no
  // IntersectionObserver global at all, so branching the initial state on
  // its presence would make the server and first client render disagree
  // and trigger a hydration mismatch.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Practically universal browser support today; the fallback just
    // reveals on the next frame instead of leaving the section invisible.
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
