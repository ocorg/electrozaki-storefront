import { MessageCircle } from "lucide-react";

// Plain anchor, no client JS needed. Positioned bottom-right per the phase-2
// spec, sized comfortably above the 44px touch-target minimum, and kept at
// a z-index below modals/popups (z-40) so a future gift-picker or
// compatibility-selector dialog can still sit on top of it without a fight.
export function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/212667654430"
      aria-label="Contactez-nous sur WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
    >
      <MessageCircle size={26} strokeWidth={2} fill="currentColor" className="text-white" />
    </a>
  );
}
