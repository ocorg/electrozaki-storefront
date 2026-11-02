import { BadgeCheck, Clock, Wrench } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// The three things people ask first about a repair: what it costs (the
// repair itself; the quote is free), how long it takes, and which parts.
export function RepairFacts({ t, className = "" }: { t: Dictionary; className?: string }) {
  const icons = [BadgeCheck, Clock, Wrench];
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {t.repairPage.facts.map((fact, i) => {
        const Icon = icons[i] ?? BadgeCheck;
        return (
          <li key={fact} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-white/10 px-3.5 text-sm font-semibold text-white ring-1 ring-white/15">
            <Icon size={15} aria-hidden className="flex-none text-gold" />
            {fact}
          </li>
        );
      })}
    </ul>
  );
}
