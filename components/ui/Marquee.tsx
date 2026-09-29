import type { ReactNode } from "react";

// Endless horizontal ticker (CSS only). The list is rendered twice and the
// track slides by exactly half its width, so the loop has no seam. Paused on
// hover; static under reduced motion (see globals.css). The duplicate copy
// is hidden from screen readers.
export function Marquee({
  items,
  className = "",
  durationS = 40,
  separator,
}: {
  items: ReactNode[];
  className?: string;
  durationS?: number;
  separator?: ReactNode;
}) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex flex-none items-center">
      {items.map((item, i) => (
        <li key={i} className="flex flex-none items-center">
          {item}
          {separator && <span aria-hidden className="flex-none">{separator}</span>}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`group overflow-hidden ${className}`}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ ["--marquee-duration" as string]: `${durationS}s` }}
      >
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
