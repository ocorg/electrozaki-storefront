import type { LucideIcon } from "lucide-react";

export type IconTileTone = "ink" | "neutral" | "gold";

const TONE_CLASSES: Record<IconTileTone, string> = {
  ink: "bg-ink text-gold",
  neutral: "bg-neutral-100 text-neutral-700",
  gold: "bg-gold/15 text-gold-deep",
};

// Squircle (phone-icon corners) rather than a circle: the site's shapes
// echo an app grid.
export function IconTile({
  icon: Icon,
  tone = "ink",
  size = 44,
  className = "",
}: {
  icon: LucideIcon;
  tone?: IconTileTone;
  size?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`inline-flex flex-none items-center justify-center rounded-[30%] ${TONE_CLASSES[tone]} ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.48)} strokeWidth={2} />
    </div>
  );
}
