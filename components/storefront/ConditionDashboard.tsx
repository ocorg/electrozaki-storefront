import { BatteryCharging, Ban, ScanFace, MonitorSmartphone, type LucideIcon } from "lucide-react";

type Props = {
  batteryHealthPercent: number | null;
  batteryGenuine: boolean | null;
  screenGenuine: boolean | null;
  faceIdWorking: boolean | null;
};

// Each tile is omitted entirely when its value is null (not applicable —
// an accessory, or a phone with no Face ID hardware) rather than shown as
// a false "unknown" or "defective" state.
export function ConditionDashboard({
  batteryHealthPercent,
  batteryGenuine,
  screenGenuine,
  faceIdWorking,
}: Props) {
  const tiles: { icon: LucideIcon; label: string; value: string; ok: boolean }[] = [];

  if (batteryHealthPercent !== null) {
    tiles.push({
      icon: BatteryCharging,
      label: "Batterie",
      value: `${batteryHealthPercent}%${batteryGenuine === true ? " · d'origine" : batteryGenuine === false ? " · remplacée" : ""}`,
      ok: batteryHealthPercent >= 80,
    });
  }

  if (screenGenuine !== null) {
    tiles.push({
      icon: MonitorSmartphone,
      label: "Écran",
      value: screenGenuine ? "D'origine" : "Remplacé",
      ok: screenGenuine,
    });
  }

  if (faceIdWorking !== null) {
    tiles.push({
      icon: faceIdWorking ? ScanFace : Ban,
      label: "Face ID",
      value: faceIdWorking ? "Fonctionnel" : "Non fonctionnel",
      ok: faceIdWorking,
    });
  }

  if (tiles.length === 0) return null;

  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-xl border p-3 text-center shadow-sm ${
            tile.ok ? "border-black/10 bg-white" : "border-gold/50 bg-gold/5"
          }`}
        >
          <tile.icon size={20} className={`mx-auto ${tile.ok ? "text-neutral-700" : "text-gold"}`} />
          <p className="mt-1.5 text-xs font-semibold text-neutral-500">{tile.label}</p>
          <p className="text-sm font-medium text-neutral-900">{tile.value}</p>
        </div>
      ))}
    </div>
  );
}
