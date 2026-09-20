import Link from "next/link";
import { MapPin } from "lucide-react";
import { AnchorButton } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-ink text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">
            ELECTRO <span className="text-gold">ZAKI</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Téléphones neufs et bon occasion, accessoires, et réparation à Meknès.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Liens</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/reparation" className="transition-colors hover:text-gold">
                Réparation
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-gold">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-gold">
                Mon panier
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Nous contacter</p>
          <AnchorButton href="https://wa.me/212667654430" variant="accent" size="sm" className="mt-3">
            WhatsApp
          </AnchorButton>
          <p className="mt-4 flex items-center gap-1.5 text-sm">
            <MapPin size={15} className="text-gold" />
            Meknès, Maroc
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Electro Zaki. Tous droits réservés.
      </div>
    </footer>
  );
}
