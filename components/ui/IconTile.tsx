import type { LucideIcon } from "lucide-react";

export type IconTileTone = "ink" | "neutral" | "gold";

const TONE_CLASSES: Record<IconTileTone, string> = {
  ink: "bg-ink text-gold",
  neutral: "bg-neutral-100 text-neutral-700",
  gold: "bg-gold/15 text-ink",
};

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
      className={`inline-flex flex-none items-center justify-center rounded-full ${TONE_CLASSES[tone]} ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </div>
  );
}
