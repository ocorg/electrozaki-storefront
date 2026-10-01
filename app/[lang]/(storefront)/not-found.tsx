import Link from "@/components/i18n/Link";
import { LinkButton } from "@/components/ui/Button";
import { getT } from "@/lib/i18n/server";

// 404, in the shop's language: a phone with no signal.
export default async function NotFound() {
  const t = await getT();
  const n = t.notFound;
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <div aria-hidden className="flex items-end gap-1.5">
        {[14, 22, 30, 38].map((h, i) => (
          <span key={h} className={`w-3 rounded-sm ${i === 0 ? "bg-ink" : "bg-ink/15"}`} style={{ height: h }} />
        ))}
      </div>
      <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{n.eyebrow}</p>
      <h1 className="font-display mt-3 text-5xl font-extrabold text-ink sm:text-6xl">{n.title}</h1>
      <p className="mt-4 max-w-md text-lg text-neutral-600">
        {n.text}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/collections/telephones" variant="accent">
          {n.seePhones}
        </LinkButton>
        <LinkButton href="/collections/accessoires" variant="outline">
          {t.common.accessories}
        </LinkButton>
      </div>
      <Link href="/" className="mt-6 text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
        {n.backHome}
      </Link>
    </section>
  );
}
