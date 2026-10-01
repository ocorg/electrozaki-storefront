import { MapPin, MessageCircle } from "lucide-react";
import Link from "@/components/i18n/Link";
import { AnchorButton } from "@/components/ui/Button";
import { SHOP, WHATSAPP_URL } from "@/lib/site";
import { getT } from "@/lib/i18n/server";
import { categoryName } from "@/lib/i18n/labels";
import type { AisleStat } from "@/lib/db/storefront";

const linkClass = "inline-flex min-h-9 items-center text-neutral-300 transition-colors hover:text-gold-bright";

export async function Footer({ aisles }: { aisles: AisleStat[] }) {
  const t = await getT();
  return (
    <footer className="on-dark pcb mt-24 overflow-hidden text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 pt-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            {/* The wordmark is a logo: always Latin, always left-to-right. */}
            <p className="font-display text-2xl font-extrabold tracking-tight text-white">
              <span dir="ltr">
                ELECTRO <span className="text-gold">ZAKI</span>
              </span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed">{t.footer.blurb(t.common.city)}</p>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">{t.common.aisles}</p>
            <ul className="mt-4 grid gap-0.5 text-sm">
              {aisles.slice(0, 8).map((a) => (
                <li key={a.slug}>
                  <Link href={`/collections/${a.slug}`} className={linkClass}>
                    {categoryName(t, a.slug, a.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">{t.footer.services}</p>
            <ul className="mt-4 grid gap-0.5 text-sm">
              <li><Link href="/reparation" className={linkClass}>{t.common.repair}</Link></li>
              <li><Link href="/reparation/suivi" className={linkClass}>{t.common.trackRepair}</Link></li>
              <li><Link href="/contact" className={linkClass}>{t.common.contact}</Link></li>
              <li><Link href="/cart" className={linkClass}>{t.common.myCart}</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-gold">{t.footer.writeUs}</p>
            <p className="mt-4 text-sm">{t.footer.writeUsText}</p>
            <AnchorButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm" className="mt-4">
              <MessageCircle size={17} aria-hidden /> <span dir="ltr">{SHOP.whatsappDisplay}</span>
            </AnchorButton>
            <p className="mt-5 flex items-center gap-1.5 text-sm">
              <MapPin size={15} className="text-gold" aria-hidden />
              {t.common.city}, {t.common.country}
            </p>
          </div>
        </div>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <p
        aria-hidden
        dir="ltr"
        className="pointer-events-none mt-14 select-none whitespace-nowrap text-center font-display text-[18vw] font-extrabold leading-[0.78] tracking-[-0.05em] text-white/5 md:text-[15vw]"
      >
        ELECTRO ZAKI
      </p>

      <div className="relative border-t border-white/10 px-4 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-center text-xs text-neutral-400 md:pb-5">
        © {new Date().getFullYear()} {SHOP.name} · {t.common.city}. {t.footer.rights}
      </div>
    </footer>
  );
}
