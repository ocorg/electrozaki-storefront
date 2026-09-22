import {
  BatteryCharging,
  Ban,
  ScanFace,
  MonitorSmartphone,
  Camera,
  Plug,
  Volume2,
  type LucideIcon,
} from "lucide-react";

export type ConditionData = {
  batteryHealthPercent: number | null;
  batteryGenuine: boolean | null;
  screenGenuine: boolean | null;
  faceIdWorking: boolean | null;
  cameraGenuine: boolean | null;
  chargingPortGenuine: boolean | null;
  speakerGenuine: boolean | null;
};

type Tile = { icon: LucideIcon; label: string; value: string; ok: boolean };

// Each tile is omitted entirely when its value is null (not applicable —
// an accessory, or a phone with no Face ID hardware) rather than shown as
// a false "unknown" or "defective" state.
function buildTiles(data: ConditionData): Tile[] {
  const tiles: Tile[] = [];

  if (data.batteryHealthPercent !== null) {
    tiles.push({
      icon: BatteryCharging,
      label: "Batterie",
      value: `${data.batteryHealthPercent}%${data.batteryGenuine === true ? " · d'origine" : data.batteryGenuine === false ? " · remplacée" : ""}`,
      ok: data.batteryHealthPercent >= 80,
    });
  }

  if (data.screenGenuine !== null) {
    tiles.push({
      icon: MonitorSmartphone,
      label: "Écran",
      value: data.screenGenuine ? "D'origine" : "Remplacé",
      ok: data.screenGenuine,
    });
  }

  if (data.cameraGenuine !== null) {
    tiles.push({
      icon: Camera,
      label: "Caméra",
      value: data.cameraGenuine ? "D'origine" : "Remplacée",
      ok: data.cameraGenuine,
    });
  }

  if (data.chargingPortGenuine !== null) {
    tiles.push({
      icon: Plug,
      label: "Port de charge",
      value: data.chargingPortGenuine ? "D'origine" : "Remplacé",
      ok: data.chargingPortGenuine,
    });
  }

  if (data.speakerGenuine !== null) {
    tiles.push({
      icon: Volume2,
      label: "Haut-parleur",
      value: data.speakerGenuine ? "D'origine" : "Remplacé",
      ok: data.speakerGenuine,
    });
  }

  if (data.faceIdWorking !== null) {
    tiles.push({
      icon: data.faceIdWorking ? ScanFace : Ban,
      label: "Face ID",
      value: data.faceIdWorking ? "Fonctionnel" : "Non fonctionnel",
      ok: data.faceIdWorking,
    });
  }

  return tiles;
}

export function ConditionDashboard(props: ConditionData) {
  const tiles = buildTiles(props);
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
