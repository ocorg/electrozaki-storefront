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

// "Fiche de l'appareil": battery drawn as a big battery gauge, every other
// part as a checklist row — green check for original/working, amber mark
// for replaced (the text always says which, colour is only a reinforcement).
export function ConditionDashboard(props: ConditionData) {
  const tiles = buildTiles(props).filter((t) => t.label !== "Batterie");
  const battery = props.batteryHealthPercent;
  if (tiles.length === 0 && battery === null) return null;

  const level = battery ?? 0;
  const fill = level >= 85 ? "bg-signal" : level >= 80 ? "bg-amber-500" : "bg-red-600";
  const verdict = level >= 85 ? "Excellente" : level >= 80 ? "Correcte" : "À surveiller";

  return (
    <section aria-label="État de l'appareil" className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white">
      <p className="border-b border-ink/6 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
        Fiche de l&apos;appareil
      </p>
      <div className={`grid ${battery !== null && tiles.length ? "sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}>
        {battery !== null && (
          <div className="flex flex-col justify-center gap-3 border-ink/6 p-5 sm:border-r">
            <p className="text-sm font-semibold text-neutral-700">Santé de la batterie</p>
            <div className="flex items-center gap-3">
              <div aria-hidden className="relative flex h-12 flex-1 rounded-xl border-2 border-ink/70 p-1">
                <span
                  className={`h-full rounded-lg ${fill} transition-[width] duration-700 ease-out-quint`}
                  style={{ width: `${Math.max(6, Math.min(100, level))}%` }}
                />
                <span className="absolute -right-[7px] top-1/2 h-5 w-[5px] -translate-y-1/2 rounded-r-md bg-ink/70" />
              </div>
              <p className="readout ml-2 text-3xl font-bold text-ink">
                {level}
                <span className="text-lg">%</span>
              </p>
            </div>
            <p className="text-sm text-neutral-600">
              {verdict}
              {props.batteryGenuine === true ? " · batterie d'origine" : props.batteryGenuine === false ? " · batterie remplacée" : ""}
            </p>
          </div>
        )}
        {tiles.length > 0 && (
          <ul className="divide-y divide-ink/6">
            {tiles.map((tile) => (
              <li key={tile.label} className="flex items-center gap-3 px-5 py-3">
                <tile.icon size={18} aria-hidden className="flex-none text-neutral-600" />
                <span className="flex-1 text-sm text-neutral-700">{tile.label}</span>
                <span className={`text-sm font-semibold ${tile.ok ? "text-ink" : "text-amber-800"}`}>{tile.value}</span>
                <span
                  aria-hidden
                  className={`flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                    tile.ok ? "bg-signal/15 text-signal" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {tile.ok ? "✓" : "!"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
