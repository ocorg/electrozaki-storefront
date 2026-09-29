import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";

// 404, in the shop's language: a phone with no signal.
export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <div aria-hidden className="flex items-end gap-1.5">
        {[14, 22, 30, 38].map((h, i) => (
          <span key={h} className={`w-3 rounded-sm ${i === 0 ? "bg-ink" : "bg-ink/15"}`} style={{ height: h }} />
        ))}
      </div>
      <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">Erreur 404 · Pas de réseau</p>
      <h1 className="font-display mt-3 text-5xl font-extrabold text-ink sm:text-6xl">Cette page ne capte pas.</h1>
      <p className="mt-4 max-w-md text-lg text-neutral-600">
        Le produit a peut-être été vendu, ou le lien a changé. Nos rayons, eux, sont bien là.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/collections/telephones" variant="accent">
          Voir les téléphones
        </LinkButton>
        <LinkButton href="/collections/accessoires" variant="outline">
          Accessoires
        </LinkButton>
      </div>
      <Link href="/" className="mt-6 text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
