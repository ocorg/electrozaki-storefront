import { AlertTriangle, Ban, BatteryWarning, Camera, CheckCircle2, MonitorSmartphone, Plug, Volume2, type LucideIcon } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { batteryGood } from "@/lib/battery";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SpecRow } from "@/lib/offers/spec-row";

export type ConditionData = {
  batteryHealthPercent: number | null;
  batteryGenuine: boolean | null;
  screenGenuine: boolean | null;
  faceIdWorking: boolean | null;
  cameraGenuine: boolean | null;
  chargingPortGenuine: boolean | null;
  speakerGenuine: boolean | null;
};

type Issue = { key: string; icon: LucideIcon; text: string };

// Only what differs from a phone as it left the factory is listed: a part
// that was changed, a Face ID that doesn't work. Saying "Écran : d'origine"
// reads as "the screen was replaced by an original one", so a part that was
// never changed isn't listed one by one; "no part replaced" says it once.
function issuesOf(data: ConditionData, t: Dictionary): Issue[] {
  const u = t.unitPicker;
  const parts: [string, boolean | null, LucideIcon, string][] = [
    ["screen", data.screenGenuine, MonitorSmartphone, u.screenReplaced],
    ["battery", data.batteryGenuine, BatteryWarning, u.batteryReplaced],
    ["camera", data.cameraGenuine, Camera, u.cameraReplaced],
    ["port", data.chargingPortGenuine, Plug, u.portReplaced],
    ["speaker", data.speakerGenuine, Volume2, u.speakerReplaced],
  ];
  const issues: Issue[] = parts.filter(([, genuine]) => genuine === false).map(([key, , icon, text]) => ({ key, icon, text }));
  if (data.faceIdWorking === false) issues.push({ key: "faceId", icon: Ban, text: t.conditionPanel.faceIdBroken });
  return issues;
}

/**
 * "Fiche de l'appareil": the battery health as a gauge, what was changed on
 * this phone (if anything), then the model's full spec sheet (processor,
 * memory, screen, cameras, unlocking, battery life, sound…).
 */
export function ConditionDashboard(props: ConditionData & { specs?: SpecRow[] }) {
  const t = useT();
  const c = t.conditionPanel;
  const issues = issuesOf(props, t);
  const battery = props.batteryHealthPercent;
  // The ERP says something about the parts: either a list of changes, or "none".
  const partsKnown =
    [props.screenGenuine, props.cameraGenuine, props.chargingPortGenuine, props.speakerGenuine, props.batteryGenuine].some((v) => v !== null) ||
    props.faceIdWorking !== null;
  const specs = props.specs ?? [];
  if (battery === null && !partsKnown && specs.length === 0) return null;

  const level = battery ?? 0;
  const fill = batteryGood(level) ? "bg-signal" : "bg-amber-500";
  const verdict = level >= 90 ? c.excellent : batteryGood(level) ? c.fair : c.watch;
  const allGenuine = issues.length === 0;

  return (
    <section aria-label={c.aria} className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink/8 bg-white">
      <p className="border-b border-ink/6 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
        {c.title}
      </p>

      {battery !== null && (
        <div className="flex flex-col gap-3 border-b border-ink/6 p-5">
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
            {props.batteryGenuine === false ? c.batteryReplaced : ""}
          </p>
        </div>
      )}

      {partsKnown && (
        <ul className="divide-y divide-ink/6 border-b border-ink/6">
          {allGenuine ? (
            <li className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-ink">
              <CheckCircle2 size={18} aria-hidden className="flex-none text-signal" />
              {c.noneReplaced}
            </li>
          ) : (
            issues.map((issue) => (
              <li key={issue.key} className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-amber-900">
                <issue.icon size={18} aria-hidden className="flex-none text-amber-700" />
                <span className="flex-1">{issue.text}</span>
                <AlertTriangle size={16} aria-hidden className="flex-none text-amber-600" />
              </li>
            ))
          )}
        </ul>
      )}

      {specs.length > 0 && (
        <dl className="divide-y divide-ink/6">
          {specs.map((row) => (
            <div key={row.label} className="grid gap-0.5 px-5 py-3 sm:grid-cols-[9.5rem_1fr] sm:gap-4">
              <dt className="text-sm text-neutral-600">{row.label}</dt>
              <dd className="text-sm font-semibold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
