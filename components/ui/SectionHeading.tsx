import type { ReactNode } from "react";

// Section title used across the storefront: a numbered mono eyebrow
// ("01 — Rayons"), a display headline and an optional action on the right.
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  action,
  tone = "light",
  id,
  className = "",
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  id?: string;
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-4 ${className}`}>
      <div className="max-w-2xl">
        <p className={`font-mono text-xs font-semibold uppercase tracking-[0.18em] ${dark ? "text-gold" : "text-gold-deep"}`}>
          {index && <span className="me-2">{index} -</span>}
          {eyebrow}
        </p>
        <h2
          id={id}
          className={`font-display mt-3 text-[2rem] font-bold leading-[1.05] sm:text-[2.6rem] ${dark ? "text-white" : "text-ink"}`}
        >
          {title}
        </h2>
        {intro && <p className={`mt-3 text-base leading-relaxed sm:text-lg ${dark ? "text-neutral-300" : "text-neutral-600"}`}>{intro}</p>}
      </div>
      {action}
    </div>
  );
}
