import type { HTMLAttributes } from "react";

export function cardClasses(className = "") {
  return `rounded-xl border border-black/10 bg-white shadow-sm ${className}`.trim();
}

// For cards that are also interactive (links, selectable tiles) — adds
// elevation + lift on hover instead of just swapping the border color.
export function interactiveCardClasses(className = "") {
  return `${cardClasses()} transition-all duration-150 hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-md ${className}`.trim();
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cardClasses(className)} {...props} />;
}
