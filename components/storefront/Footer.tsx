import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import { AnchorButton } from "@/components/ui/Button";
import { SHOP, WHATSAPP_URL } from "@/lib/site";
import type { AisleStat } from "@/lib/db/storefront";

const linkClass = "inline-flex min-h-9 items-center text-neutral-300 transition-colors hover:text-gold-bright";

export function Footer({ aisles }: { aisles: AisleStat[] }) {
  return (
    <footer className="on-dark pcb mt-24 overflow-hidden text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-white">
              ELECTRO <span className="text-gold">ZAKI</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Téléphones neufs et d&apos;occasion, accessoires et réparation à {SHOP.city}. Chaque téléphone
              d&apos;occasion est vendu avec son état et sa batterie affichés.
            </p>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">Rayons</p>
            <ul className="mt-4 grid gap-0.5 text-sm">
              {aisles.slice(0, 8).map((a) => (
                <li key={a.slug}>
                  <Link href={`/collections/${a.slug}`} className={linkClass}>
                    {a.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">Services</p>
            <ul className="mt-4 grid gap-0.5 text-sm">
              <li><Link href="/reparation" className={linkClass}>Réparation</Link></li>
              <li><Link href="/reparation/suivi" className={linkClass}>Suivre ma réparation</Link></li>
              <li><Link href="/contact" className={linkClass}>Contact</Link></li>
              <li><Link href="/cart" className={linkClass}>Mon panier</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">Nous écrire</p>
            <p className="mt-4 text-sm">Photos, disponibilités, prix : on répond sur WhatsApp.</p>
            <AnchorButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm" className="mt-4">
              <MessageCircle size={17} aria-hidden /> {SHOP.whatsappDisplay}
            </AnchorButton>
            <p className="mt-5 flex items-center gap-1.5 text-sm">
              <MapPin size={15} className="text-gold" aria-hidden />
              {SHOP.city}, Maroc
            </p>
          </div>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <p
        aria-hidden
        className="pointer-events-none mt-14 select-none whitespace-nowrap text-center font-display text-[18vw] font-extrabold leading-[0.78] tracking-[-0.05em] text-white/[0.05] md:text-[15vw]"
      >
        ELECTRO ZAKI
      </p>

      <div className="relative border-t border-white/10 px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center text-xs text-neutral-400 md:pb-5">
        © {new Date().getFullYear()} {SHOP.name} · {SHOP.city}. Tous droits réservés.
      </div>
    </footer>
  );
}
