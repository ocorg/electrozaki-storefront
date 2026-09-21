import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "gold" | "success" | "dark" | "sale";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-black/5 text-neutral-700",
  gold: "border border-gold/40 bg-gold/10 text-ink",
  success: "bg-green-50 text-green-800",
  dark: "bg-ink text-gold",
  sale: "bg-red-600 text-white",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
