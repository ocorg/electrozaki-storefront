import {
  Ban,
  ScanFace,
  MonitorSmartphone,
  Camera,
  Plug,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type ConditionData = {
  batteryHealthPercent: number | null;
  batteryGenuine: boolean | null;
  screenGenuine: boolean | null;
  faceIdWorking: boolean | null;
  cameraGenuine: boolean | null;
  chargingPortGenuine: boolean | null;
  speakerGenuine: boolean | null;
};

type Tile = { key: string; icon: LucideIcon; label: string; value: string; ok: boolean };

// Each tile is omitted entirely when its value is null (not applicable —
// an accessory, or a phone with no Face ID hardware) rather than shown as
// a false "unknown" or "defective" state.
function buildTiles(data: ConditionData, t: Dictionary): Tile[] {
  const c = t.conditionPanel;
  const tiles: Tile[] = [];
  // [key, genuine?, icon, label, "replaced" agreeing with the part's gender]
  const parts: [string, boolean | null, LucideIcon, string, string][] = [
    ["screen", data.screenGenuine, MonitorSmartphone, c.screen, c.replacedM],
    ["camera", data.cameraGenuine, Camera, c.camera, c.replacedF],
    ["port", data.chargingPortGenuine, Plug, c.port, c.replacedM],
    ["speaker", data.speakerGenuine, Volume2, c.speaker, c.replacedM],
  ];
  for (const [key, genuine, icon, label, replaced] of parts) {
    if (genuine !== null) tiles.push({ key, icon, label, value: genuine ? c.original : replaced, ok: genuine });
  }
  if (data.faceIdWorking !== null) {
    tiles.push({
      key: "faceId",
      icon: data.faceIdWorking ? ScanFace : Ban,
      label: c.faceId,
      value: data.faceIdWorking ? c.working : c.notWorking,
      ok: data.faceIdWorking,
    });
  }
  return tiles;
}

// "Fiche de l'appareil": battery drawn as a big battery gauge, every other
// part as a checklist row — green check for original/working, amber mark
// for replaced (the text always says which, colour is only a reinforcement).
export function ConditionDashboard(props: ConditionData) {
  const t = useT();
  const c = t.conditionPanel;
  const tiles = buildTiles(props, t);
  const battery = props.batteryHealthPercent;
  if (tiles.length === 0 && battery === null) return null;

  const level = battery ?? 0;
  const fill = level >= 85 ? "bg-signal" : level >= 80 ? "bg-amber-500" : "bg-red-600";
  const verdict = level >= 85 ? c.excellent : level >= 80 ? c.fair : c.watch;

  return (
    <section aria-label={c.aria} className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white">
      <p className="border-b border-ink/6 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
        {c.title}
      </p>
      <div className={`grid ${battery !== null && tiles.length ? "sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]" : ""}`}>
        {battery !== null && (
          <div className="flex flex-col justify-center gap-3 border-ink/6 p-5 sm:border-e">
            <p className="text-sm font-semibold text-neutral-700">{c.batteryHealth}</p>
            <div className="flex items-center gap-3">
              <div aria-hidden dir="ltr" className="relative flex h-12 flex-1 rounded-xl border-2 border-ink/70 p-1">
                <span
                  className={`h-full rounded-lg ${fill} transition-[width] duration-700 ease-out-quint`}
                  style={{ width: `${Math.max(6, Math.min(100, level))}%` }}
                />
                <span className="absolute -right-[7px] top-1/2 h-5 w-[5px] -translate-y-1/2 rounded-r-md bg-ink/70" />
              </div>
              <p dir="ltr" className="readout ms-2 text-3xl font-bold text-ink">
                {level}
                <span className="text-lg">%</span>
              </p>
            </div>
            <p className="text-sm text-neutral-600">
              {verdict}
              {props.batteryGenuine === true ? c.batteryOriginal : props.batteryGenuine === false ? c.batteryReplaced : ""}
            </p>
          </div>
        )}
        {tiles.length > 0 && (
          <ul className="divide-y divide-ink/6">
            {tiles.map((tile) => (
              <li key={tile.key} className="flex items-center gap-3 px-5 py-3">
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
