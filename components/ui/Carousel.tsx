"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Touch/trackpad users already have native swipe via the snap-x scroller —
// these arrows exist for mouse users, who have no other affordance that the
// row scrolls at all.
export function Carousel({ children, className = "" }: { children: ReactNode; className?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const updateState = () => {
      // Scroll-snap + inline padding means the resting scrollLeft at the
      // "start" is the container's own padding value (e.g. 16px for px-4),
      // not 0 — measure against that instead of a flat epsilon.
      const style = getComputedStyle(el);
      const paddingLeft = parseFloat(style.paddingLeft) || 0;
      const paddingRight = parseFloat(style.paddingRight) || 0;
      setCanScrollLeft(el.scrollLeft > paddingLeft + 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - paddingRight - 4);
    };

    updateState();
    el.addEventListener("scroll", updateState, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      el.removeEventListener("scroll", updateState);
      window.removeEventListener("resize", updateState);
    };
  }, [children]);

  function scrollByDirection(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 scrollbar-none ${className}`.trim()}
      >
        {children}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          aria-label="Précédent"
          onClick={() => scrollByDirection(-1)}
          className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white p-2 text-neutral-700 shadow-md transition-colors hover:border-gold hover:text-ink md:flex"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Suivant"
          onClick={() => scrollByDirection(1)}
          className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white p-2 text-neutral-700 shadow-md transition-colors hover:border-gold hover:text-ink md:flex"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}
