import { useMemo } from "react";
import { BatteryFull, Check } from "lucide-react";
import { formatMAD, savingOf } from "@/lib/format";
import { swatch } from "@/lib/colors";
import type { VariantData } from "@/components/storefront/ProductVariantExperience";

// Used phones: every unit is different (colour, battery, parts, price). The
// customer narrows down by colour, then battery range, then picks one of the
// matching phones — instead of scrolling one long list.

export type BatteryRange = "all" | "90" | "85" | "80" | "low" | "na";

const RANGES: { key: Exclude<BatteryRange, "all">; label: string; test: (b: number | null) => boolean }[] = [
  { key: "90", label: "90 % et plus", test: (b) => b !== null && b >= 90 },
  { key: "85", label: "85 à 89 %", test: (b) => b !== null && b >= 85 && b < 90 },
  { key: "80", label: "80 à 84 %", test: (b) => b !== null && b >= 80 && b < 85 },
  { key: "low", label: "Moins de 80 %", test: (b) => b !== null && b < 80 },
  { key: "na", label: "Non indiquée", test: (b) => b === null },
];

/** In-stock units matching a colour + battery range, cheapest (then best battery) first. */
export function matchUnits(units: VariantData[], color: string, battery: BatteryRange): VariantData[] {
  return units
    .filter((u) => u.stockQuantity > 0)
    .filter((u) => color === "all" || (u.color ?? "Autre") === color)
    .filter((u) => battery === "all" || RANGES.find((r) => r.key === battery)?.test(u.batteryHealthPercent))
    .sort(
      (a, b) =>
        Number(a.priceOverride ?? 0) - Number(b.priceOverride ?? 0) ||
        (b.batteryHealthPercent ?? 0) - (a.batteryHealthPercent ?? 0)
    );
}

// Short, factual labels for the parts a unit had replaced.
function partsOf(v: VariantData): string[] {
  const parts: string[] = [];
  if (v.screenGenuine === false) parts.push("Écran remplacé");
  if (v.batteryGenuine === false) parts.push("Batterie remplacée");
  if (v.cameraGenuine === false) parts.push("Caméra remplacée");
  if (v.chargingPortGenuine === false) parts.push("Port de charge remplacé");
  if (v.speakerGenuine === false) parts.push("Haut-parleur remplacé");
  if (!parts.length && v.hasDefects) parts.push("Pièces remplacées");
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
};

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors ${
        on ? "border-gold bg-gold/10 font-medium text-ink" : "border-black/15 text-neutral-700 hover:border-gold"
      }`}
    >
      {children}
    </button>
  );
}

export function UnitPicker({ units, color, battery, selectedId, onColor, onBattery, onSelect }: Props) {
  const inStock = useMemo(() => units.filter((u) => u.stockQuantity > 0), [units]);

  const colors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const u of inStock) {
      const c = u.color ?? "Autre";
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"));
  }, [inStock]);

  const byColor = inStock.filter((u) => color === "all" || (u.color ?? "Autre") === color);
  const ranges = RANGES.map((r) => ({ ...r, count: byColor.filter((u) => r.test(u.batteryHealthPercent)).length })).filter(
    (r) => r.count > 0
  );
  const matching = matchUnits(units, color, battery);

  return (
    <div className="space-y-4">
      {colors.length > 1 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">1. Couleur</p>
          <div className="flex flex-wrap gap-2">
            <Chip on={color === "all"} onClick={() => onColor("all")}>
              Toutes <span className="text-neutral-400">{inStock.length}</span>
            </Chip>
            {colors.map(([c, n]) => (
              <Chip key={c} on={color === c} onClick={() => onColor(c)}>
                <span className="h-4 w-4 rounded-full border border-black/15" style={{ background: swatch(c) }} aria-hidden />
                {c} <span className="text-neutral-400">{n}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      {ranges.length > 1 && (
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {colors.length > 1 ? "2. " : ""}Batterie
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip on={battery === "all"} onClick={() => onBattery("all")}>
              Toutes <span className="text-neutral-400">{byColor.length}</span>
            </Chip>
            {ranges.map((r) => (
              <Chip key={r.key} on={battery === r.key} onClick={() => onBattery(r.key)}>
                {r.label} <span className="text-neutral-400">{r.count}</span>
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {matching.length} téléphone{matching.length > 1 ? "s" : ""} disponible{matching.length > 1 ? "s" : ""} — choisissez le vôtre
        </p>
        {matching.length === 0 ? (
          <p className="rounded-lg bg-neutral-50 px-3 py-3 text-sm text-neutral-600">
            Aucun téléphone ne correspond. Essayez une autre couleur ou une autre batterie.
          </p>
        ) : (
          <div role="radiogroup" aria-label="Téléphones disponibles" className="grid gap-2 sm:grid-cols-2">
            {matching.map((u) => {
              const on = u.id === selectedId;
              const parts = partsOf(u);
              const b = u.batteryHealthPercent;
              const saving = savingOf(u.priceOverride, u.compareAtPrice);
              return (
                <button
                  key={u.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onSelect(u.id)}
                  className={`relative rounded-xl border p-3 text-left transition-colors ${
                    on ? "border-gold bg-gold/5 ring-2 ring-gold/30" : "border-black/10 bg-white hover:border-gold"
                  }`}
                >
                  {on && (
                    <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
                      <Check size={13} />
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ background: swatch(u.color) }} aria-hidden />
                    {u.color ?? "—"}
                  </span>
                  {b !== null && (
                    <span className="mt-2 flex items-center gap-2 text-sm">
                      <BatteryFull size={16} className={b >= 85 ? "text-green-600" : b >= 80 ? "text-amber-600" : "text-red-600"} />
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                        <span
                          className={`block h-full rounded-full ${b >= 85 ? "bg-green-500" : b >= 80 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${b}%` }}
                        />
                      </span>
                      <span className="tabular-nums font-medium">{b} %</span>
                    </span>
                  )}
                  <span className={`mt-2 block text-xs ${parts.length ? "text-amber-800" : "text-green-700"}`}>
                    {parts.length ? parts.join(" · ") : "Pièces d'origine"}
                  </span>
                  <span className="mt-2 flex flex-wrap items-baseline gap-x-2">
                    <span className="text-lg font-bold">{formatMAD(Number(u.priceOverride ?? 0))}</span>
                    {saving !== null && u.compareAtPrice && (
                      <>
                        <span className="text-sm text-neutral-500 line-through">{formatMAD(u.compareAtPrice)}</span>
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
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
