import { MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/lib/site";

// Plain anchor, no client JS. Sits above the mobile tab bar on phones, and
// below modals (z-40) so a dialog can still cover it. The icon is ink, not
// white: white on WhatsApp green is 1.98:1, ink is 9.5:1.
export function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Écrivez-nous sur WhatsApp"
      className="group fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 items-center gap-2 rounded-full bg-whatsapp pl-4 pr-4 text-ink shadow-[0_14px_30px_-10px_rgb(37_211_102/0.8)] transition-all duration-300 hover:pr-5 md:bottom-6 md:right-6"
    >
      <span className="relative flex">
        <MessageCircle size={24} strokeWidth={2.2} aria-hidden />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse-dot rounded-full bg-ink ring-2 ring-whatsapp" />
      </span>
      <span className="hidden text-sm font-bold lg:inline">Une question ?</span>
    </a>
  );
}
