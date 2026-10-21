import { Star } from "lucide-react";

// A row of 5 stars for a rating (halves rounded to the nearest half). The
// stars fill from the reading side, so from the right in Arabic.
export function Stars({ value, size = 16, label, className = "" }: { value: number; size?: number; label: string; className?: string }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span role="img" aria-label={label} className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0;
        return (
          <span key={i} className="relative inline-flex" style={{ width: size, height: size }} aria-hidden>
            <Star size={size} className="text-neutral-300" fill="currentColor" strokeWidth={0} />
            {fill > 0 && (
              <span className="absolute inset-y-0 inset-s-0 overflow-hidden" style={{ width: fill === 1 ? size : size / 2 }}>
                <Star size={size} className="text-gold" fill="currentColor" strokeWidth={0} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
