import type { ReactNode } from "react";

// Fades a section in as it scrolls into view. Pure CSS (see .reveal in
// globals.css): no script, so the section is visible as soon as the page
// arrives, even before its scripts have run. `as="li"` keeps lists valid.
// `delayMs` is kept for the callers' staggered lists; the scroll position
// now sets the timing.
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "li";
}) {
  return <Tag className={`reveal ${className}`.trim()}>{children}</Tag>;
}
