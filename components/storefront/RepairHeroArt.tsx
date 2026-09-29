// A phone whose screen cracks, gets scanned, and comes back whole with a
// brass check — the repair promise in one loop. SVG + CSS keyframes only
// (.crack / .scan-line / .heal in globals.css); static and clean under
// reduced motion.
export function RepairHeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 520" className={className} aria-hidden fill="none">
      <defs>
        <linearGradient id="rh-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2a241b" />
          <stop offset="1" stopColor="#0d0c0b" />
        </linearGradient>
        <linearGradient id="rh-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e6b555" stopOpacity="0" />
          <stop offset="0.5" stopColor="#e6b555" stopOpacity="0.9" />
          <stop offset="1" stopColor="#e6b555" stopOpacity="0" />
        </linearGradient>
        <clipPath id="rh-clip">
          <rect x="22" y="22" width="216" height="476" rx="34" />
        </clipPath>
      </defs>
      {/* body */}
      <rect x="8" y="8" width="244" height="504" rx="46" fill="#26242a" stroke="#c8922a" strokeOpacity=".45" strokeWidth="2" />
      <rect x="22" y="22" width="216" height="476" rx="34" fill="url(#rh-screen)" />
      <rect x="94" y="36" width="72" height="20" rx="10" fill="#000" />
      <g clipPath="url(#rh-clip)">
        {/* cracks from an impact point */}
        <g className="crack" stroke="#f3eee6" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M168 170l-26 38-40 10-30 46-44 18" />
          <path d="M168 170l38-30 30 6" />
          <path d="M168 170l12 52 36 40 22 60" />
          <path d="M168 170l-54-40-30-50" />
          <path d="M142 208l-8 62 24 58-14 70" />
          <path d="M162 170a6 6 0 1 0 12 0a6 6 0 1 0-12 0" />
        </g>
        {/* scanning line */}
        <rect className="scan-line" x="22" y="22" width="216" height="36" fill="url(#rh-scan)" />
      </g>
      {/* healed: brass check */}
      <g className="heal" style={{ transformOrigin: "130px 260px" }}>
        <circle cx="130" cy="260" r="46" fill="#c8922a" />
        <path d="M110 261l14 14 28-30" stroke="#111013" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <rect x="92" y="478" width="76" height="5" rx="2.5" fill="#fff" fillOpacity=".7" />
    </svg>
  );
}
