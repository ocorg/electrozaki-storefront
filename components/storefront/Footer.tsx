import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-black/10 bg-black text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-extrabold text-white">
            ELECTRO <span className="text-[#c8922a]">ZAKI</span>
          </p>
          <p className="mt-2 text-sm">
            Téléphones neufs et reconditionnés, accessoires, et réparation à Meknès.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Liens</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/reparation" className="hover:text-[#c8922a]">
                Réparation
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[#c8922a]">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#c8922a]">
                Mon panier
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Nous contacter</p>
          <a
            href="https://wa.me/212667654430"
            className="mt-2 inline-block rounded bg-[#c8922a] px-4 py-2 text-sm font-medium text-black"
          >
            WhatsApp
          </a>
          <p className="mt-3 text-sm">Meknès, Maroc</p>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Electro Zaki. Tous droits réservés.
      </div>
    </footer>
  );
}
