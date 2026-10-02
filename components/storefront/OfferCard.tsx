import Image from "next/image";
import { ArrowRight, Clock, Tag } from "lucide-react";
import Link from "@/components/i18n/Link";
import { formatMAD } from "@/lib/format";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { LiveOffer } from "@/lib/offers/live";

/** "jeudi 25 septembre"-style end date in the page's language, Western digits. */
function endDate(iso: string, intl: string): string {
  return new Date(iso).toLocaleDateString(`${intl}-u-nu-latn`, { timeZone: "Etc/GMT", day: "numeric", month: "long" });
}

// One live offer as a wide card: photo, title, what makes it worth it, the
// price (or the discount), and the way in. Used on /offres and the home page.
export function OfferCard({ offer, t, intl, priority = false }: { offer: LiveOffer; t: Dictionary; intl: string; priority?: boolean }) {
  const saving = offer.price !== null && offer.normalPrice !== null && offer.normalPrice > offer.price ? offer.normalPrice - offer.price : 0;
  return (
    <Link
      href={offer.href}
      className="group on-dark grid overflow-hidden rounded-4xl bg-ink text-white shadow-[0_30px_60px_-35px_rgb(17_16_19/0.7)] transition-transform duration-500 ease-out-quint hover:-translate-y-1 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="relative aspect-4/3 bg-white sm:aspect-auto sm:min-h-72">
        {offer.image ? (
          <Image
            src={offer.image}
            alt={offer.title}
            fill
            priority={priority}
            sizes="(min-width: 640px) 45vw, 100vw"
            className="object-contain p-4 transition-transform duration-700 ease-out-quint group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink/20">
            <Tag size={64} aria-hidden />
          </div>
        )}
        {saving > 0 && (
          <span dir="ltr" className="absolute inset-s-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-sm font-bold text-white">
            -{formatMAD(saving)}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <p className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-gold opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          {t.offers.live}
        </p>
        <h3 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{offer.title}</h3>
        {offer.teaser && <p className="text-lg text-neutral-300">{offer.teaser}</p>}

        {offer.price !== null ? (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm text-neutral-400">{t.offers.from}</span>
            <span dir="ltr" className="readout text-4xl font-bold text-gold">
              {formatMAD(offer.price)}
            </span>
            {saving > 0 && offer.normalPrice !== null && (
              <span className="text-sm text-neutral-400">
                {t.offers.instead} <span className="readout line-through">{formatMAD(offer.normalPrice)}</span>
              </span>
            )}
          </p>
        ) : (
          offer.discount && (
            <p dir="auto" className="readout text-3xl font-bold text-gold">
              {t.offers.discount(offer.discount)}
            </p>
          )
        )}

        {offer.endsAt && (
          <p className="inline-flex items-center gap-1.5 text-sm text-neutral-400">
            <Clock size={15} aria-hidden /> {t.offers.until(endDate(offer.endsAt, intl))}
          </p>
        )}

        <span className="mt-2 inline-flex min-h-12 w-fit items-center gap-2 rounded-full bg-gold px-6 font-bold text-ink transition-[filter] group-hover:brightness-105">
          {t.offers.see}
          <ArrowRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
