import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { RepairDiagnostic } from "@/components/storefront/RepairDiagnostic";
import { AnchorButton } from "@/components/ui/Button";
import { interactiveCardClasses } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";
import { REPAIR_TOPIC_ORDER, REPAIR_TOPICS } from "@/lib/repair-faq";

export const metadata: Metadata = {
  title: "Réparation — Electro Zaki",
  description:
    "Réparation de téléphones à Meknès : écran, batterie, port de charge, caméra, et plus. Devis gratuit sur WhatsApp.",
};

const SERVICES = REPAIR_TOPIC_ORDER.map((slug) => REPAIR_TOPICS[slug]);

export default function ReparationPage() {
  return (
    <div>
      <section className="border-b border-black/10 bg-ink px-4 py-20 text-center text-white sm:py-28">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Votre téléphone cassé ? <span className="text-gold">On s&apos;en occupe.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-neutral-300">
          Diagnostic rapide, pièces de qualité, devis gratuit avant toute réparation.
        </p>
        <AnchorButton href="#diagnostic" variant="accent" className="mt-8">
          Demander un diagnostic ou un devis
        </AnchorButton>
      </section>

      <section id="diagnostic" className="mx-auto max-w-2xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Demander un diagnostic ou un devis
        </h2>
        <p className="mt-2 text-center text-neutral-600">
          3 étapes rapides, sans avoir à décrire techniquement le problème.
        </p>
        <RepairDiagnostic />
      </section>

      <section className="border-t border-black/10 px-4 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
          Nos services de réparation
        </h2>
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <Reveal key={s.slug} delayMs={i * 60}>
              <Link href={`/reparation/${s.slug}`} className={interactiveCardClasses("flex h-full flex-col p-6")}>
                <IconTile icon={s.icon} tone="gold" size={40} />
                <h3 className="mt-3 font-semibold">{s.shortTitle}</h3>
                <p className="mt-2 flex-1 text-sm text-neutral-600">{s.cardDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold">
                  Voir les questions fréquentes
                  <ArrowRight size={15} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-black/10 bg-neutral-50 px-4 py-16 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl">Une question sur votre appareil ?</h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          Envoyez-nous une photo ou décrivez le problème sur WhatsApp — réponse rapide, sans
          engagement.
        </p>
        <AnchorButton href="https://wa.me/212667654430" className="mt-6">
          Discuter sur WhatsApp
        </AnchorButton>
      </section>
    </div>
  );
}
