import type { HTMLAttributes } from "react";

export function cardClasses(className = "") {
  return `rounded-2xl border border-ink/[0.08] bg-white shadow-[0_1px_2px_rgb(17_16_19/0.04),0_8px_24px_-12px_rgb(17_16_19/0.12)] ${className}`.trim();
}

// For cards that are also interactive (links, selectable tiles): lift,
// brass edge and a deeper shadow on hover; springy press on tap.
export function interactiveCardClasses(className = "") {
  return `${cardClasses()} transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_2px_4px_rgb(17_16_19/0.04),0_22px_40px_-18px_rgb(17_16_19/0.28)] active:translate-y-0 active:scale-[0.99] ${className}`.trim();
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cardClasses(className)} {...props} />;
}
