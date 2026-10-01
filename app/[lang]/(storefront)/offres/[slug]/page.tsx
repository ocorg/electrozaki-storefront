import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/i18n/Link";
import { Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { getLandingPage } from "@/lib/db/landing";
import { LinkButton } from "@/components/ui/Button";
import { ViewBeacon, Countdown, CopyCode, OfferProductCard } from "./OfferParts";
import { LOCALE_META } from "@/lib/i18n/config";
import { getLocale, getT } from "@/lib/i18n/server";
import { alternates } from "@/lib/i18n/seo";

// Refreshed at once by the ERP on every change (/api/revalidate), and at
// least every minute so a page opens / closes on time.
export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

// Per-page colour set chosen in the ERP.
const THEMES = {
  GOLD: { bg: "#15171c", text: "#ffffff", accent: "#b8912f" },
  INK: { bg: "#f4f2ec", text: "#15171c", accent: "#15171c" },
  OCEAN: { bg: "#123a57", text: "#ffffff", accent: "#1f6fa8" },
  CORAL: { bg: "#7a2418", text: "#ffffff", accent: "#d9573f" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [data, locale] = await Promise.all([getLandingPage(slug), getLocale()]);
  if (!data) return {};
  return {
    title: data.page.title,
    description: data.page.subtitle ?? undefined,
    alternates: alternates(locale, `/offres/${slug}`),
    openGraph: data.page.bannerUrl ? { images: [data.page.bannerUrl] } : undefined,
  };
}

export default async function OfferPage({ params }: Props) {
  const { slug } = await params;
  const [data, t, locale] = await Promise.all([getLandingPage(slug), getT(), getLocale()]);
  if (!data) notFound();
  const o = t.offer;
  const { page, status, products } = data;
  const theme = THEMES[page.theme];

  if (status !== "live") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">{page.title}</h1>
        <p className="mt-3 text-neutral-600">
          {status === "scheduled" && page.startsAt
            ? o.startsOn(
                page.startsAt.toLocaleDateString(`${LOCALE_META[locale].intl}-u-nu-latn`, {
                  timeZone: "Etc/GMT",
                  day: "numeric",
                  month: "long",
                })
              )
            : o.ended}
        </p>
        <LinkButton href="/" className="mt-6">
          {o.seeShop}
        </LinkButton>
      </div>
    );
  }

  const code = page.promoCode?.active ? page.promoCode : null;

  return (
    <div>
      <ViewBeacon pageId={page.id} />

      <section style={{ background: theme.bg, color: theme.text }} className="px-4 py-10 sm:py-14">
        <div className="mx-auto grid max-w-6xl items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80">{o.eyebrow}</p>
            <h1 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl">{page.title}</h1>
            {page.subtitle && <p className="text-lg opacity-90">{page.subtitle}</p>}
            {page.endsAt && <Countdown endsAt={page.endsAt.toISOString()} />}
            {code && (
              <div className="space-y-1">
                <p className="text-sm opacity-90">
                  {o.codeLine(code.type === "PERCENTAGE" ? `-${Number(code.value)} %` : `-${Number(code.value)} DH`)}
                </p>
                <CopyCode code={code.code} />
              </div>
            )}
            <a href="#produits" className="inline-flex min-h-11 items-center rounded-lg px-5 font-semibold text-white" style={{ background: theme.accent }}>
              {o.seeItems(products.length > 1)}
            </a>
          </div>
          {page.bannerUrl && (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
              <Image src={page.bannerUrl} alt={page.title} fill priority className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
            </div>
          )}
        </div>
      </section>

      {page.body && (
        <section className="mx-auto max-w-3xl px-4 pt-10">
          <p className="whitespace-pre-line text-neutral-700">{page.body}</p>
        </section>
      )}

      <section id="produits" className="mx-auto max-w-6xl px-4 py-10">
        {products.length === 0 ? (
          <p className="rounded-xl bg-neutral-50 p-6 text-center text-neutral-600">
            {o.goneBefore}{" "}
            <Link href="/" className="underline">
              {o.discoverShop}
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <OfferProductCard key={p.id} product={p} landingId={page.id} accent={theme.accent} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-black/10 bg-neutral-50 px-4 py-8">
        <div className="mx-auto grid max-w-4xl gap-4 text-sm text-neutral-700 sm:grid-cols-3">
          <p className="flex items-center gap-2"><Truck size={18} /> {o.trustDelivery}</p>
          <p className="flex items-center gap-2"><ShieldCheck size={18} /> {o.trustCod}</p>
          <p className="flex items-center gap-2"><MessageCircle size={18} /> {o.trustQuestion}</p>
        </div>
      </section>
    </div>
  );
}
