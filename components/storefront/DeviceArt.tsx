import type { ArtKind } from "@/lib/category-art";

// Line drawings of what the shop sells, one per aisle. Drawn on a 120×120
// grid with a 2.5 stroke so they sit together as one family; the main line
// uses currentColor and details use `--art-accent` (brass by default), so
// the same drawing works on paper and on ink.

const ACCENT = "var(--art-accent, var(--color-gold))";

function Phone() {
  return (
    <>
      <rect x="37" y="10" width="46" height="100" rx="11" />
      <rect x="41.5" y="14.5" width="37" height="91" rx="7.5" fill={ACCENT} fillOpacity=".08" stroke="none" />
      <rect x="52" y="17" width="16" height="5" rx="2.5" fill="currentColor" stroke="none" />
      <path d="M85 32v10M35 30v6M35 40v8" />
      <path d="M50 88h20" stroke={ACCENT} />
    </>
  );
}

function Case() {
  return (
    <>
      <rect x="34" y="10" width="52" height="100" rx="13" />
      <rect x="40" y="16" width="24" height="24" rx="7" stroke={ACCENT} />
      <circle cx="47" cy="23" r="3.5" />
      <circle cx="57" cy="23" r="3.5" />
      <circle cx="47" cy="33" r="3.5" />
      <path d="M86 34v12M34 32v6" />
      <path d="M52 76a8 8 0 1 0 16 0a8 8 0 1 0-16 0" stroke={ACCENT} strokeOpacity=".7" />
    </>
  );
}

function Glass() {
  return (
    <>
      <rect x="30" y="18" width="46" height="92" rx="10" strokeOpacity=".35" />
      <rect x="42" y="10" width="46" height="92" rx="10" />
      <rect x="55" y="15" width="18" height="4" rx="2" fill="currentColor" stroke="none" />
      <path d="M54 44l22-18M54 60l30-26M66 76l16-14" stroke={ACCENT} />
    </>
  );
}

function Charger() {
  return (
    <>
      <path d="M50 16v18M70 16v18" strokeWidth="4" />
      <rect x="32" y="34" width="56" height="62" rx="14" />
      <rect x="50" y="78" width="20" height="7" rx="3.5" fill={ACCENT} fillOpacity=".2" stroke={ACCENT} />
      <path d="M62 46l-8 12h10l-8 12" stroke={ACCENT} />
    </>
  );
}

function Cable() {
  return (
    <>
      <rect x="22" y="14" width="14" height="22" rx="4" />
      <rect x="25.5" y="7" width="7" height="7" rx="1.5" stroke={ACCENT} />
      <path d="M29 36c0 34 20 30 30 30s32 2 32 22" />
      <rect x="84" y="88" width="14" height="22" rx="4" />
      <rect x="87.5" y="110" width="7" height="4" rx="1.5" stroke={ACCENT} />
      <circle cx="59" cy="66" r="3" fill={ACCENT} stroke="none" />
    </>
  );
}

function Earbuds() {
  return (
    <>
      <circle cx="42" cy="40" r="13" />
      <rect x="36" y="50" width="11" height="44" rx="5.5" />
      <circle cx="42" cy="40" r="5" stroke={ACCENT} />
      <circle cx="80" cy="34" r="13" />
      <rect x="74" y="44" width="11" height="44" rx="5.5" />
      <circle cx="80" cy="34" r="5" stroke={ACCENT} />
    </>
  );
}

function Airpods() {
  return (
    <>
      <rect x="26" y="40" width="68" height="60" rx="22" />
      <path d="M26 62h68" />
      <circle cx="60" cy="80" r="2.5" fill={ACCENT} stroke="none" />
      <path d="M46 40V26a6 6 0 0 1 12 0v14M62 40V26a6 6 0 0 1 12 0v14" stroke={ACCENT} />
    </>
  );
}

function Headphones() {
  return (
    <>
      <path d="M26 74V62a34 34 0 0 1 68 0v12" />
      <rect x="20" y="66" width="18" height="34" rx="8" />
      <rect x="82" y="66" width="18" height="34" rx="8" />
      <path d="M29 76v14M91 76v14" stroke={ACCENT} />
    </>
  );
}

function Powerbank() {
  return (
    <>
      <rect x="36" y="12" width="48" height="96" rx="12" />
      <path d="M63 38l-10 16h12l-10 16" stroke={ACCENT} />
      <path d="M50 92h4M58 92h4M66 92h4" stroke={ACCENT} strokeWidth="4" />
      <path d="M52 12V8h16v4" />
    </>
  );
}

function Watch() {
  return (
    <>
      <path d="M46 34l3-22h22l3 22M46 86l3 22h22l3-22" />
      <rect x="36" y="32" width="48" height="56" rx="14" />
      <path d="M84 52h4v12h-4" />
      <path d="M60 48v14l8 6" stroke={ACCENT} />
    </>
  );
}

function Sim() {
  return (
    <>
      <path d="M42 12h30l18 18v74a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V18a6 6 0 0 1 6-6z" />
      <rect x="48" y="50" width="28" height="34" rx="5" stroke={ACCENT} />
      <path d="M48 62h28M48 72h28M62 50v34" stroke={ACCENT} strokeWidth="1.8" />
    </>
  );
}

function Mount() {
  return (
    <>
      <circle cx="60" cy="46" r="28" />
      <circle cx="60" cy="46" r="16" stroke={ACCENT} />
      <path d="M60 30v-4M60 66v-4M44 46h-4M80 46h-4" stroke={ACCENT} />
      <path d="M60 74v18M44 108h32M52 92h16l6 16H46z" />
    </>
  );
}

function Pad() {
  return (
    <>
      <rect x="20" y="42" width="80" height="40" rx="20" />
      <path d="M36 62h48" stroke={ACCENT} strokeDasharray="2 7" strokeWidth="3.5" />
      <path d="M44 42V32M76 42V32" />
    </>
  );
}

function Bolt() {
  return (
    <>
      <circle cx="60" cy="60" r="42" />
      <path d="M66 28L44 64h16l-6 28 22-36H60z" stroke={ACCENT} strokeLinejoin="round" />
    </>
  );
}

const ART: Record<ArtKind, () => React.ReactElement> = {
  phone: Phone,
  case: Case,
  glass: Glass,
  charger: Charger,
  cable: Cable,
  earbuds: Earbuds,
  airpods: Airpods,
  headphones: Headphones,
  powerbank: Powerbank,
  watch: Watch,
  sim: Sim,
  mount: Mount,
  pad: Pad,
  bolt: Bolt,
};

export function DeviceArt({ kind, className = "", title }: { kind: ArtKind; className?: string; title?: string }) {
  const Drawing = ART[kind];
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <Drawing />
    </svg>
  );
}
