import { CONDITION_BARS, CONDITION_LABEL } from "@/lib/conditions";

// A phone's condition drawn as its signal bars: 4 bars = Neuf, 1 bar =
// pièces remplacées. The label is always written next to it, so the bars
// are a reading aid, never the only carrier of meaning.
export function GradeMeter({
  grade,
  tone = "light",
  size = "sm",
  showLabel = true,
}: {
  grade: string;
  tone?: "light" | "dark";
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const bars = CONDITION_BARS[grade] ?? 0;
  const label = CONDITION_LABEL[grade] ?? grade;
  const on = tone === "dark" ? "bg-gold" : "bg-ink";
  const off = tone === "dark" ? "bg-white/20" : "bg-ink/15";
  const h = size === "md" ? [6, 10, 14, 18] : [4, 7, 10, 13];

  return (
    <span className="inline-flex items-center gap-2" title={`État : ${label}`}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {h.map((height, i) => (
          <span
            key={height}
            className={`${size === "md" ? "w-[4px]" : "w-[3px]"} rounded-[1px] ${i < bars ? on : off}`}
            style={{ height }}
          />
        ))}
      </span>
      {showLabel && (
        <span
          className={`${size === "md" ? "text-sm" : "text-xs"} font-semibold ${tone === "dark" ? "text-white" : "text-neutral-800"}`}
        >
          {label}
        </span>
      )}
    </span>
  );
}

/** Battery health as a tiny battery icon filled to the level. */
export function BatteryLevel({
  percent,
  tone = "light",
  label,
}: {
  percent: number;
  tone?: "light" | "dark";
  /** text shown instead of "NN %" (e.g. a range "81–92 %") */
  label?: string;
}) {
  const color = percent >= 85 ? "bg-signal" : percent >= 80 ? "bg-amber-500" : "bg-red-600";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="sr-only">Batterie</span>
      <span
        aria-hidden
        className={`relative flex h-[11px] w-[22px] rounded-[3px] border p-[1.5px] ${tone === "dark" ? "border-white/60" : "border-ink/50"}`}
      >
        <span className={`h-full rounded-[1px] ${color}`} style={{ width: `${Math.max(8, Math.min(100, percent))}%` }} />
        <span
          className={`absolute -right-[3.5px] top-1/2 h-[5px] w-[2px] -translate-y-1/2 rounded-r-sm ${tone === "dark" ? "bg-white/60" : "bg-ink/50"}`}
        />
      </span>
      <span className={`readout text-xs font-semibold ${tone === "dark" ? "text-white" : "text-neutral-800"}`}>
        {label ?? <>{percent}&nbsp;%</>}
      </span>
    </span>
  );
}
