"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Fades a section in the first time it scrolls into view, then disconnects —
// no replay jank scrolling back up. Pure CSS transition (see .reveal in
// globals.css, only active when scripting is enabled); this component only
// toggles the class at the right time. `as="li"` keeps lists valid.
export function Reveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "li";
}) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  // Must start false on both server and client — the server has no
  // IntersectionObserver global at all, so branching the initial state on
  // its presence would make the server and first client render disagree
  // and trigger a hydration mismatch.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
      // Start slightly before the element enters, so fast scrollers never
      // see an empty gap.
      { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
