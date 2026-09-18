import type { Metadata } from "next";
import { RepairDiagnostic } from "@/components/storefront/RepairDiagnostic";

export const metadata: Metadata = {
  title: "Réparation — Electro Zaki",
  description:
    "Réparation de téléphones à Meknès : écran, batterie, port de charge, caméra, et plus. Devis gratuit sur WhatsApp.",
};

const SERVICES = [
  { title: "Écran cassé", desc: "Remplacement d'écran toutes marques, pièces de qualité." },
  { title: "Batterie", desc: "Batterie qui ne tient plus la charge ? On la remplace." },
  { title: "Port de charge", desc: "Le téléphone ne charge plus ou mal — réparation rapide." },
  { title: "Caméra", desc: "Photo floue ou caméra hors service, diagnostic et réparation." },
  { title: "Son / Micro", desc: "Haut-parleur ou micro défaillant, remis en état." },
  { title: "Désimlockage réseau", desc: "Déblocage réseau pour utiliser votre téléphone partout." },
];

export default function ReparationPage() {
  return (
    <div>
      <section className="border-b border-black/10 bg-[#121212] px-4 py-20 text-center text-white">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Votre téléphone cassé ? <span className="text-[#c8922a]">On s&apos;en occupe.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-neutral-300">
          Diagnostic rapide, pièces de qualité, devis gratuit avant toute réparation.
        </p>
        <a
          href="#diagnostic"
          className="mt-6 inline-block rounded bg-[#c8922a] px-6 py-3 font-semibold text-black transition-opacity hover:opacity-90"
        >
          Demander un diagnostic ou un devis
        </a>
      </section>

      <section id="diagnostic" className="mx-auto max-w-2xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold">Demander un diagnostic ou un devis</h2>
        <p className="mt-2 text-center text-neutral-600">
          3 étapes rapides, sans avoir à décrire techniquement le problème.
        </p>
        <RepairDiagnostic />
      </section>

      <section className="border-t border-black/10 px-4 py-14">
        <h2 className="mb-8 text-center text-2xl font-bold">Nos services de réparation</h2>
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="rounded-lg border border-black/10 p-6 transition-colors hover:border-[#c8922a]"
            >
              <h3 className="font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-black/10 bg-neutral-50 px-4 py-14 text-center">
        <h2 className="text-2xl font-bold">Une question sur votre appareil ?</h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-600">
          Envoyez-nous une photo ou décrivez le problème sur WhatsApp — réponse rapide, sans
          engagement.
        </p>
        <a
          href="https://wa.me/212667654430"
          className="mt-6 inline-block rounded bg-[#121212] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c8922a] hover:text-black"
        >
          Discuter sur WhatsApp
        </a>
      </section>
    </div>
  );
}
