import type { CSSProperties } from "react";
import { Banknote, BatteryFull, ShieldCheck, Truck, type LucideIcon } from "lucide-react";

// The hero's "quick settings": the shop's promises drawn as a phone's
// control-center toggles, switching on one after the other. Only promises
// the site already makes elsewhere — never stock figures, which are private.
const TILES: { icon: LucideIcon; title: string; value: string }[] = [
  { icon: Truck, title: "Livraison", value: "Tout le Maroc" },
  { icon: Banknote, title: "Paiement", value: "À la livraison" },
  { icon: ShieldCheck, title: "Garantie", value: "Incluse" },
  { icon: BatteryFull, title: "Batterie", value: "Affichée" },
];

export function ControlCenter() {
  return (
    <div className="mt-12 max-w-xl border-t border-white/10 pt-6">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-300">
        Réglages de la boutique
      </p>
      <ul aria-label="Nos engagements" className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TILES.map(({ icon: Icon, title, value }, i) => (
          <li
            key={title}
            className="flex flex-col gap-3 rounded-[1.35rem] border border-white/10 bg-white/6 p-3.5 backdrop-blur-md"
          >
            <span
              aria-hidden
              className="cc-toggle flex h-10 w-10 items-center justify-center rounded-full"
              style={{ "--cc-delay": `${0.5 + i * 0.28}s` } as CSSProperties}
            >
              <Icon size={19} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-sm font-bold leading-tight text-white">{title}</span>
              <span className="mt-0.5 block text-xs leading-snug text-neutral-300">{value}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
