import {
  BatteryCharging,
  Camera,
  Check,
  Cpu,
  Lock,
  MonitorSmartphone,
  PackageCheck,
  ShieldCheck,
  Volume2,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { ModelFacts } from "@/lib/offers/models";

// "Contrôle Electro Zaki": what the technicians check on every used phone before it
// is put on sale (the shop's own list, all brands). The list follows the
// phone: Face ID or the fingerprint reader, the iCloud or Google/Samsung
// account, the OLED burn-in check only on an OLED screen; the score counts
// exactly the points shown. A new phone isn't opened: it gets "Neuf, scellé".

type Group = { key: string; icon: LucideIcon; items: string[] };

function groupsFor(facts: ModelFacts | null, brand: string | null): Group[] {
  const apple = brand?.toLowerCase() === "apple";
  const samsung = brand?.toLowerCase() === "samsung";
  const oled = /OLED/i.test(facts?.specs.display ?? "");
  const unlock = facts?.unlock === "faceid" ? "faceId" : facts?.unlock && facts.unlock !== "face" ? "fingerprint" : null;
  const groups: Group[] = [
    { key: "screen", icon: MonitorSmartphone, items: ["touch", "pixels", ...(oled ? ["burnIn"] : []), "brightness"] },
    { key: "battery", icon: BatteryCharging, items: ["health", "charging"] },
    { key: "camera", icon: Camera, items: ["lenses", "front", "focus", "video", "videoSound"] },
    { key: "sound", icon: Volume2, items: ["speakers", "mics", "call", "vibration"] },
    { key: "network", icon: Wifi, items: ["sim", "wifi", "bluetooth"] },
    { key: "security", icon: Lock, items: [...(unlock ? [unlock] : []), apple ? "icloud" : samsung ? "samsung" : "google", "imei"] },
    { key: "system", icon: Cpu, items: ["buttons", "sensors", "speed", "update"] },
  ];
  return groups;
}

export function InspectionReport({
  t,
  facts,
  brand,
  isNew,
  compact = false,
  className = "",
}: {
  t: Dictionary;
  facts: ModelFacts | null;
  brand: string | null;
  isNew: boolean;
  /** in a narrow column (product page): two columns at most */
  compact?: boolean;
  className?: string;
}) {
  const c = t.inspection;

  if (isNew) {
    return (
      <section aria-labelledby="sealed" className={`rounded-[1.75rem] bg-ink p-6 text-white sm:p-8 ${className}`}>
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-gold text-ink">
            <PackageCheck size={28} aria-hidden />
          </span>
          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold">{c.newEyebrow}</p>
            <h2 id="sealed" className="font-display text-2xl font-bold">{c.newTitle}</h2>
          </div>
        </div>
        <p className="mt-4 text-neutral-300">{c.newIntro}</p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {c.newItems.map((item) => (
            <li key={item} className="flex items-center gap-2.5 rounded-2xl bg-white/6 px-4 py-3 text-sm font-semibold">
              <Check size={16} aria-hidden className="flex-none text-gold" /> {item}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const groups = groupsFor(facts, brand);
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section aria-labelledby="inspection" className={`overflow-hidden rounded-[1.75rem] bg-ink text-white ${className}`}>
      <div className="flex flex-wrap items-center gap-5 p-6 sm:p-8">
        {/* The score: a stamp, like a passed inspection. */}
        <div
          dir="ltr"
          className="flex h-24 w-24 flex-none flex-col items-center justify-center rounded-full border-2 border-dashed border-gold/70 bg-gold/10"
        >
          <ShieldCheck size={20} aria-hidden className="text-gold" />
          <p className="readout mt-0.5 text-2xl font-bold leading-none text-gold">
            {total}/{total}
          </p>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold">{c.eyebrow}</p>
          <h2 id="inspection" className="font-display mt-1 text-2xl font-bold leading-tight sm:text-3xl">
            {c.title(total)}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-300">{c.intro}</p>
        </div>
      </div>

      <div className={`grid gap-px bg-white/8 sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-3"}`}>
        {groups.map((g) => (
          <div key={g.key} className="bg-ink p-5">
            <p className="flex items-center gap-2 text-sm font-bold">
              <g.icon size={17} aria-hidden className="text-gold" />
              <span className="flex-1">{c.groups[g.key]}</span>
              <span dir="ltr" className="readout text-xs font-semibold text-emerald-400">
                {g.items.length}/{g.items.length}
              </span>
            </p>
            <ul className="mt-3 space-y-1.5">
              {g.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-snug text-neutral-300">
                  <Check size={14} aria-hidden className="mt-0.5 flex-none text-emerald-400" />
                  {c.items[item]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
