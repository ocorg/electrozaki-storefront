import { useMemo } from "react";
import { useT } from "@/components/i18n/I18nProvider";
import { colorName } from "@/lib/i18n/labels";
import { batteryGood } from "@/lib/battery";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { BatteryFull, Check } from "lucide-react";
import { formatMAD, savingOf } from "@/lib/format";
import { swatch } from "@/lib/colors";
import type { VariantData } from "@/components/storefront/ProductVariantExperience";

// Used phones: every unit is different (colour, battery, parts, price). The
// customer narrows down by colour, then battery range, then picks one of the
// matching phones — instead of scrolling one long list.

export type BatteryRange = "all" | "90" | "85" | "80" | "low" | "na";

// Labels are in the dictionary (t.unitPicker.ranges).
const RANGES: { key: Exclude<BatteryRange, "all">; test: (b: number | null) => boolean }[] = [
  { key: "90", test: (b) => b !== null && b >= 90 },
  { key: "85", test: (b) => b !== null && b >= 85 && b < 90 },
  { key: "80", test: (b) => b !== null && b >= 80 && b < 85 },
  { key: "low", test: (b) => b !== null && b < 80 },
  { key: "na", test: (b) => b === null },
];

// Units with no colour set group under one key; its label is translated.
const NO_COLOR = "__none__";

/** In-stock units matching a colour + battery range, cheapest (then best battery) first. */
export function matchUnits(units: VariantData[], color: string, battery: BatteryRange): VariantData[] {
  return units
    .filter((u) => u.stockQuantity > 0)
    .filter((u) => color === "all" || (u.color ?? NO_COLOR) === color)
    .filter((u) => battery === "all" || RANGES.find((r) => r.key === battery)?.test(u.batteryHealthPercent))
    .sort(
      (a, b) =>
        Number(a.priceOverride ?? 0) - Number(b.priceOverride ?? 0) ||
        (b.batteryHealthPercent ?? 0) - (a.batteryHealthPercent ?? 0)
    );
}

// Short, factual labels for the parts a unit had replaced.
function partsOf(v: VariantData, t: Dictionary): string[] {
  const u = t.unitPicker;
  const parts: string[] = [];
  if (v.screenGenuine === false) parts.push(u.screenReplaced);
  if (v.batteryGenuine === false) parts.push(u.batteryReplaced);
  if (v.cameraGenuine === false) parts.push(u.cameraReplaced);
  if (v.chargingPortGenuine === false) parts.push(u.portReplaced);
  if (v.speakerGenuine === false) parts.push(u.speakerReplaced);
  if (!parts.length && v.hasDefects) parts.push(u.partsReplaced);
  return parts;
}

type Props = {
  units: VariantData[];
  color: string;
  battery: BatteryRange;
  selectedId: string | undefined;
  onColor: (c: string) => void;
  onBattery: (b: BatteryRange) => void;
  onSelect: (id: string) => void;
  /** every colour the model has had: the ones with no phone here show crossed out */
  allColors?: string[];
};

// An option out of stock stays visible, crossed out and not selectable, so
// the customer sees what the model comes in (and that it isn't here now).
export function OptionChip({
  on,
  onClick,
  disabled = false,
  unavailableLabel,
  children,
}: {
  on: boolean;
  onClick: () => void;
  disabled?: boolean;
  unavailableLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      aria-pressed={on}
      aria-disabled={disabled || undefined}
      title={disabled ? unavailableLabel : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed border-dashed border-ink/15 bg-paper text-neutral-400 line-through decoration-neutral-400"
          : on
            ? "border-gold-deep bg-gold/15 font-semibold text-ink"
            : "border-ink/15 bg-white text-neutral-800 hover:border-ink/40"
      }`}
    >
      {children}
      {disabled && unavailableLabel && <span className="sr-only">({unavailableLabel})</span>}
    </button>
  );
}
const Chip = OptionChip;

export function UnitPicker({ units, color, battery, selectedId, onColor, onBattery, onSelect, allColors = [] }: Props) {
  const t = useT();
  const label = (c: string) => (c === NO_COLOR ? t.unitPicker.other : colorName(t, c));
  const inStock = useMemo(() => units.filter((u) => u.stockQuantity > 0), [units]);

  const colors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of inStock) {
      const c = u.color ?? NO_COLOR;
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const here = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"));
    // The model's other colours, after the ones in stock, with no phone (0).
    const missing = allColors.filter((c) => !counts.has(c)).map((c) => [c, 0] as [string, number]);
    return [...here, ...missing];
  }, [inStock, allColors]);

  const byColor = inStock.filter((u) => color === "all" || (u.color ?? NO_COLOR) === color);
  // Every battery range ("not stated" only when a unit has none), the empty
  // ones crossed out; how many is never shown (stock is private).
  const hasRange = (r: (typeof RANGES)[number]) => byColor.some((u) => r.test(u.batteryHealthPercent));
  const ranges = RANGES.filter((r) => r.key !== "na" || hasRange(r));
  const anyBattery = byColor.some((u) => u.batteryHealthPercent !== null);
  const matching = matchUnits(units, color, battery);

  return (
    <div className="space-y-4">
      {colors.length > 1 && (
        <div>
          <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">1. {t.unitPicker.color}</p>
          <div className="flex flex-wrap gap-2">
            <Chip on={color === "all"} onClick={() => onColor("all")}>
              {t.unitPicker.all}
            </Chip>
            {colors.map(([c, n]) => (
              <Chip key={c} on={color === c} onClick={() => onColor(c)} disabled={n === 0} unavailableLabel={t.unitPicker.unavailable}>
                <span className="h-4 w-4 rounded-full border border-black/15" style={{ background: swatch(c) }} aria-hidden />
                {label(c)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {anyBattery && ranges.filter(hasRange).length >= 1 && (
        <div>
          <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">
            {colors.length > 1 ? "2. " : ""}{t.unitPicker.battery}
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip on={battery === "all"} onClick={() => onBattery("all")}>
              {t.unitPicker.all}
            </Chip>
            {ranges.map((r) => (
              <Chip key={r.key} on={battery === r.key} onClick={() => onBattery(r.key)} disabled={!hasRange(r)} unavailableLabel={t.unitPicker.unavailable}>
                {t.unitPicker.ranges[r.key]}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-neutral-600">
          {t.unitPicker.choose}
        </p>
        {matching.length === 0 ? (
          <p className="rounded-lg bg-neutral-50 px-3 py-3 text-sm text-neutral-600">
            {t.unitPicker.noMatch}
          </p>
        ) : (
          <div role="radiogroup" aria-label={t.unitPicker.available} className="grid gap-2 sm:grid-cols-2">
            {matching.map((u) => {
              const on = u.id === selectedId;
              const parts = partsOf(u, t);
              const b = u.batteryHealthPercent;
              const saving = savingOf(u.priceOverride, u.compareAtPrice);
              return (
                <button
                  key={u.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(u.id)}
                  className={`relative rounded-2xl border p-3.5 text-start transition-all ${
                    on ? "border-gold-deep bg-gold/6 ring-2 ring-gold/40" : "border-ink/10 bg-white hover:border-ink/30"
                  }`}
                >
                  {on && (
                    <span className="absolute inset-e-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-ink">
                      <Check size={13} />
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ background: swatch(u.color) }} aria-hidden />
                    {u.color ? colorName(t, u.color) : "-"}
                  </span>
                  {u.badge && <span className="mt-1 block text-xs font-semibold text-neutral-700">{u.badge}</span>}
                  {b !== null && (
                    <span className="mt-2 flex items-center gap-2 text-sm">
                      <BatteryFull size={16} className={batteryGood(b) ? "text-green-600" : "text-amber-600"} />
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <span
                          className={`block h-full rounded-full ${batteryGood(b) ? "bg-green-500" : "bg-amber-500"}`}
                          style={{ width: `${b}%` }}
                        />
                      </span>
                      <span dir="ltr" className="tabular-nums font-medium">{b} %</span>
                    </span>
                  )}
                  <span className={`mt-2 block text-xs ${parts.length ? "text-amber-800" : "text-green-800"}`}>
                    {parts.length ? parts.join(" · ") : t.unitPicker.originalParts}
                  </span>
                  <span className="mt-2 flex flex-wrap items-baseline gap-x-2">
                    <span className="readout text-lg font-bold">{formatMAD(Number(u.priceOverride ?? 0))}</span>
                    {saving !== null && u.compareAtPrice && (
                      <>
                        <span className="text-sm text-neutral-500 line-through">{formatMAD(u.compareAtPrice)}</span>
                        <span dir="ltr" className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          -{formatMAD(saving)}
                        </span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
