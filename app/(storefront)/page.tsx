import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageCircle, ShieldCheck, Truck, Wrench } from "lucide-react";
import { getAisles, getBrands, getHomeShelves, getShowcasePhones, getStockTotals } from "@/lib/db/storefront";
import { ProductCard } from "@/components/storefront/ProductCard";
import { PhoneFinder } from "@/components/storefront/PhoneFinder";
import { HeroPhone } from "@/components/storefront/HeroPhone";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import { GradeMeter } from "@/components/storefront/GradeMeter";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Carousel } from "@/components/ui/Carousel";
import { Reveal } from "@/components/ui/Reveal";
import { Marquee } from "@/components/ui/Marquee";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AISLE_BLURB, artFor } from "@/lib/category-art";
import { CONDITION_HINT } from "@/lib/conditions";
import { formatMAD } from "@/lib/format";
import { REPAIR_TOPIC_ORDER, REPAIR_TOPICS } from "@/lib/repair-faq";
import { WHATSAPP_URL } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const REASSURANCE = [
  { icon: ShieldCheck, title: "Garantie incluse", desc: "Sur tous les téléphones bon occasion" },
  { icon: Truck, title: "Livraison partout au Maroc", desc: "Paiement à la livraison" },
  { icon: Wrench, title: "Techniciens vérifiés", desc: "Diagnostic avant chaque vente" },
  { icon: MessageCircle, title: "Support WhatsApp", desc: "Réponse rapide, sans robot" },
];

// Accessory aisles floated around the hero phone, in this order of preference.
const HERO_CHIPS = ["pochettes", "chargeurs", "ecouteurs", "cables", "incassables", "powerbank"];
const CHIP_POSITIONS = [
  "left-0 top-[12%] [--float-rot:-4deg]",
  "right-0 top-[6%] [--float-rot:3deg] [animation-delay:-1.5s]",
  "left-0 bottom-[6%] [--float-rot:3deg] [animation-delay:-3s]",
  "right-0 bottom-[38%] [--float-rot:-3deg] [animation-delay:-4.5s]",
];

export default async function HomePage() {
  const [aisles, brands, showcase, shelves, totals] = await Promise.all([
    getAisles(),
    getBrands(),
    getShowcasePhones(6),
    getHomeShelves(),
    getStockTotals(),
  ]);

  const phonesAisle = aisles.find((a) => a.slug === "telephones");
  const accessoryAisles = aisles.filter((a) => a.slug !== "telephones");
  const chips = HERO_CHIPS.map((slug) => accessoryAisles.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 4);
  const phonePhoto = showcase.find((p) => p.image);

  return (
    <div>
      {/* ── Hero: the shop window ─────────────────────────────────────── */}
      <section aria-labelledby="hero-title" className="on-dark pcb relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-20 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-200">
              <span className="h-1.5 w-1.5 rounded-full bg-whatsapp shadow-[0_0_0_3px_rgb(37_211_102/0.25)]" aria-hidden />
              Téléphones · Accessoires · Réparation
            </p>
            <h1
              id="hero-title"
              className="font-display mt-6 text-[2.9rem] font-extrabold leading-[0.95] sm:text-[4.2rem] xl:text-[5.2rem]"
            >
              Téléphones <br />& accessoires <br />
              <span className="bg-gradient-to-r from-gold-bright via-gold to-gold-bright bg-clip-text text-transparent">
                à Meknès.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
              iPhone, Samsung, Xiaomi, neufs et d&apos;occasion — l&apos;état et la batterie de chaque appareil
              affichés avant l&apos;achat. Coques, chargeurs, câbles, écouteurs, et réparation sur place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/collections/telephones" variant="accent" size="lg" className="px-6 sm:px-8">
                Voir les téléphones <ArrowRight size={18} aria-hidden />
              </LinkButton>
              <LinkButton href="/collections/accessoires" variant="outline-dark" size="lg" className="px-6 sm:px-8">
                Accessoires
              </LinkButton>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                [totals.phones, "téléphones en rayon"],
                [totals.accessories, "accessoires"],
                [brands.length, "marques"],
              ].map(([n, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="readout block text-3xl font-bold text-gold sm:text-4xl">{n}</span>
                    <span className="mt-1 block text-sm text-neutral-300">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-[640px] lg:h-[660px]">
            {/* Brass halo behind the phone */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/25 blur-[90px]"
            />
            <div className="relative flex h-full items-center justify-center">
              <HeroPhone phones={showcase} />
            </div>
            {chips.map((a, i) => (
              <Link
                key={a.slug}
                href={`/collections/${a.slug}`}
                className={`absolute hidden animate-float items-center gap-3 rounded-2xl border border-white/10 bg-ink-2/80 p-2 pr-4 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md transition-colors hover:border-gold/60 lg:flex ${CHIP_POSITIONS[i]}`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-paper">
                  <DeviceArt kind={artFor(a.slug, a.name)} className="h-9 w-9 text-ink" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{a.name}</span>
                  {a.fromPrice !== null && (
                    <span className="readout block text-xs text-gold-bright">dès {formatMAD(a.fromPrice)}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand ribbon ──────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <div className="border-y border-ink/10 bg-gold py-4 text-ink">
          <p className="sr-only">Marques disponibles : {brands.join(", ")}</p>
          <Marquee
            durationS={36}
            items={brands.map((b) => (
              <span key={b} className="font-display px-6 text-2xl font-extrabold uppercase tracking-tight sm:text-3xl" aria-hidden>
                {b}
              </span>
            ))}
            separator={
              <svg width="18" height="18" viewBox="0 0 20 20" className="text-ink/70" aria-hidden>
                <path d="M10 0l2.6 7.4L20 10l-7.4 2.6L10 20l-2.6-7.4L0 10l7.4-2.6z" fill="currentColor" />
              </svg>
            }
          />
        </div>
      )}

      {/* ── Aisles ────────────────────────────────────────────────────── */}
      <section aria-labelledby="rayons" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <Reveal>
          <SectionHeading
            id="rayons"
            index="01"
            eyebrow="Rayons"
            title={<>Tout pour votre téléphone, rayon par rayon.</>}
          />
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {phonesAisle && (
            <Reveal className="col-span-2 row-span-2">
              <Link
                href="/collections/telephones"
                className="on-dark group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-[1.75rem] bg-ink p-6 text-white transition-transform duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1 sm:p-8"
              >
                <div aria-hidden className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-gold/25 blur-[70px]" />
                {phonePhoto?.image && (
                  <div className="absolute bottom-6 right-5 aspect-square w-[44%] max-w-[250px] rotate-6 overflow-hidden rounded-[1.4rem] bg-white p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] ring-1 ring-white/20 transition-transform duration-700 ease-[var(--ease-spring)] group-hover:-translate-y-2 group-hover:rotate-2 sm:right-8">
                    <div className="relative h-full w-full">
                      <Image src={phonePhoto.image} alt="" fill sizes="250px" className="object-contain" />
                    </div>
                  </div>
                )}
                <p className="relative font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {phonesAisle.count} en rayon
                </p>
                <p className="font-display relative mt-3 max-w-[14rem] text-4xl font-extrabold leading-none sm:text-5xl">
                  {phonesAisle.name}
                </p>
                <p className="relative mt-3 max-w-[14rem] text-sm text-neutral-300">{AISLE_BLURB.telephones}</p>
                <div className="relative mt-auto space-y-2 pt-8">
                  {(["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"] as const).map((g) => (
                    <p key={g}>
                      <GradeMeter grade={g} tone="dark" />
                    </p>
                  ))}
                  {phonesAisle.fromPrice !== null && (
                    <p className="readout pt-3 text-lg font-bold text-gold-bright">dès {formatMAD(phonesAisle.fromPrice)}</p>
                  )}
                </div>
              </Link>
            </Reveal>
          )}
          {accessoryAisles.map((a, i) => (
            <Reveal key={a.slug} delayMs={(i % 4) * 70}>
              <Link
                href={`/collections/${a.slug}`}
                className="group flex h-full min-h-[164px] flex-col rounded-[1.5rem] border border-ink/[0.07] bg-white p-4 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_44px_-26px_rgb(17_16_19/0.45)] sm:p-5"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-16 w-16 items-center justify-center rounded-[30%] bg-paper transition-colors duration-300 group-hover:bg-gold/15">
                    <DeviceArt
                      kind={artFor(a.slug, a.name)}
                      className="h-12 w-12 text-ink transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110"
                    />
                  </span>
                  <ArrowUpRight
                    size={18}
                    aria-hidden
                    className="text-neutral-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </div>
                <p className="mt-auto pt-4 text-base font-bold leading-tight text-ink">{a.name}</p>
                <p className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2 text-xs text-neutral-500">
                  <span>
                    {a.count} article{a.count > 1 ? "s" : ""}
                  </span>
                  {a.fromPrice !== null && <span className="readout font-semibold text-neutral-800">dès {formatMAD(a.fromPrice)}</span>}
                </p>
              </Link>
            </Reveal>
          ))}
          <Reveal>
            <Link
              href="/reparation"
              className="group flex h-full min-h-[164px] flex-col rounded-[1.5rem] bg-gold p-4 text-ink transition-transform duration-500 ease-[var(--ease-out-quint)] hover:-translate-y-1 sm:p-5"
            >
              <IconTile icon={Wrench} size={48} />
              <p className="mt-auto pt-4 text-base font-bold leading-tight">Réparation</p>
              <p className="mt-1 text-xs font-medium">Écran, batterie, logiciel · devis gratuit</p>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Phones shelf ──────────────────────────────────────────────── */}
      {shelves.phones.length > 0 && (
        <section aria-labelledby="arrivages" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
          <Reveal>
            <SectionHeading
              id="arrivages"
              index="02"
              eyebrow="En vitrine"
              title="Les téléphones du moment."
              action={
                <LinkButton href="/collections/telephones" variant="outline">
                  Tous les téléphones{phonesAisle ? ` (${phonesAisle.count})` : ""} <ArrowRight size={16} aria-hidden />
                </LinkButton>
              }
            />
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {shelves.phones.map((p, i) => (
              <Reveal key={p.id} delayMs={(i % 4) * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Transparency ─────────────────────────────────────────────── */}
      <section aria-labelledby="transparence" className="on-dark pcb mt-20 text-white sm:mt-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:py-24 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              id="transparence"
              index="03"
              eyebrow="L'occasion sans surprise"
              tone="dark"
              title={
                <>
                  Vous choisissez <span className="text-gold">l&apos;appareil exact</span>, pas un modèle au hasard.
                </>
              }
              intro="Chaque téléphone d'occasion est vendu à l'unité, avec sa fiche : état, santé de la batterie, et pièces d'origine ou remplacées. Ce que vous voyez est ce que vous recevez."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/collections/telephones?condition=TRES_BON" variant="accent">
                Voir les « Très bon état »
              </LinkButton>
            </div>
          </Reveal>

          <Reveal delayMs={120}>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur sm:p-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">Nos 4 états</p>
              <ul className="mt-5 divide-y divide-white/10">
                {(["NEUF", "TRES_BON", "BON", "PIECES_REMPLACEES"] as const).map((g) => (
                  <li key={g} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3.5">
                    <GradeMeter grade={g} tone="dark" size="md" />
                    <span className="text-sm text-neutral-300">{CONDITION_HINT[g]}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-7 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-neutral-300">
                Santé de la batterie
              </p>
              <div className="mt-4">
                <div className="flex h-3 overflow-hidden rounded-full" aria-hidden>
                  <span className="w-[20%] bg-red-600" />
                  <span className="w-[5%] bg-amber-500" />
                  <span className="flex-1 bg-signal" />
                </div>
                <div className="readout mt-2 flex justify-between text-xs text-neutral-300">
                  <span>&lt; 80 %</span>
                  <span>80–84 %</span>
                  <span>85–100 %</span>
                </div>
                <p className="mt-4 text-sm text-neutral-300">
                  Le pourcentage exact de chaque unité est affiché sur sa fiche, avant l&apos;ajout au panier.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Accessories shelf ────────────────────────────────────────── */}
      {shelves.accessories.length > 0 && (
        <section aria-labelledby="accessoires" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
          <Reveal>
            <SectionHeading
              id="accessoires"
              index="04"
              eyebrow="Accessoires"
              title="Petits prix, gros service."
              intro="Coques, verres trempés, chargeurs et câbles pour chaque modèle — en stock à Meknès."
              action={
                <LinkButton href="/collections/accessoires" variant="outline">
                  Tous les accessoires <ArrowRight size={16} aria-hidden />
                </LinkButton>
              }
            />
          </Reveal>
          <div className="mt-10">
            <Carousel>
              {shelves.accessories.map((p) => (
                <div key={p.id} className="flex w-[46%] flex-none snap-start sm:w-[31%] lg:w-[23.5%]">
                  <ProductCard product={p} />
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* ── Finder ───────────────────────────────────────────────────── */}
      <section id="trouver" aria-labelledby="finder" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <div className="grid gap-10 rounded-[2rem] bg-paper-2 p-6 sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:p-14">
          <Reveal>
            <SectionHeading
              id="finder"
              index="05"
              eyebrow="Conseil"
              title="Pas sûr du modèle ? Trois questions."
              intro="Budget, usage, marque : on vous montre les téléphones en stock qui correspondent."
            />
          </Reveal>
          <Reveal delayMs={100}>
            <PhoneFinder />
          </Reveal>
        </div>
      </section>

      {/* ── Repair ───────────────────────────────────────────────────── */}
      <section aria-labelledby="atelier" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <Reveal>
          <div className="on-dark relative overflow-hidden rounded-[2rem] bg-ink px-6 py-12 text-white sm:px-12 sm:py-16">
            <DeviceArt
              kind="phone"
              className="pointer-events-none absolute -right-10 -top-6 h-[420px] w-[420px] rotate-12 text-white/[0.06] [--art-accent:rgb(200_146_42/0.25)]"
            />
            <div className="relative max-w-2xl">
              <SectionHeading
                id="atelier"
                index="06"
                eyebrow="Atelier"
                tone="dark"
                title={
                  <>
                    Écran cassé ? Batterie fatiguée ? <span className="text-gold">On répare.</span>
                  </>
                }
                intro="Devis gratuit avant toute réparation, et suivi de votre appareil en ligne."
              />
              <ul className="mt-7 flex flex-wrap gap-2">
                {REPAIR_TOPIC_ORDER.map((slug) => (
                  <li key={slug}>
                    <Link
                      href={`/reparation/${slug}`}
                      className="inline-flex min-h-10 items-center rounded-full border border-white/15 px-4 text-sm font-semibold text-neutral-200 transition-colors hover:border-gold hover:text-white"
                    >
                      {REPAIR_TOPICS[slug].shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/reparation#diagnostic" variant="accent">
                  Demander un devis
                </LinkButton>
                <LinkButton href="/reparation/suivi" variant="outline-dark">
                  Suivre ma réparation
                </LinkButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Reassurance ──────────────────────────────────────────────── */}
      <section aria-label="Nos engagements" className="mx-auto max-w-7xl px-4 pt-20 sm:pt-28">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {REASSURANCE.map((item, i) => (
            <Reveal as="li" key={item.title} delayMs={i * 70} className="flex h-full items-start gap-4 rounded-[1.5rem] border border-ink/[0.07] bg-white p-5">
                <IconTile icon={item.icon} size={46} />
                <div>
                  <p className="font-bold text-ink">{item.title}</p>
                  <p className="mt-0.5 text-sm text-neutral-600">{item.desc}</p>
                </div>
            </Reveal>
          ))}
        </ul>
        <Reveal>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-whatsapp/40 bg-whatsapp/10 p-6 text-center sm:flex-row sm:text-left">
            <p className="text-lg font-semibold text-ink">
              Vous cherchez un modèle précis ? <span className="text-neutral-600">Demandez-nous, on vous répond sur WhatsApp.</span>
            </p>
            <AnchorButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="whatsapp">
              <MessageCircle size={18} aria-hidden /> Écrire sur WhatsApp
            </AnchorButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
