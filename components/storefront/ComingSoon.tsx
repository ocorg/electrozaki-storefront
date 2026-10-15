import { MessageCircle, Smartphone, Wrench } from "lucide-react";
import { AnchorButton, LinkButton } from "@/components/ui/Button";
import { DeviceArt } from "@/components/storefront/DeviceArt";
import type { ArtKind } from "@/lib/category-art";
import { whatsappLink } from "@/lib/site";
import { getT } from "@/lib/i18n/server";

/**
 * Shown in place of an accessory aisle or product while accessories aren't
 * open online yet (ACCESSORIES_OPEN in lib/site.ts): the shop has them in
 * Meknès, so the visitor is sent to WhatsApp, or on to phones and repair.
 */
export async function ComingSoon({ name, art }: { name: string; art: ArtKind }) {
  const t = await getT();
  const s = t.comingSoon;
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-16 text-center sm:py-24">
      <span className="flex h-24 w-24 items-center justify-center rounded-[30%] bg-white ring-1 ring-ink/10">
        <DeviceArt kind={art} className="h-16 w-16 text-ink" />
      </span>
      <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-deep">{s.eyebrow}</p>
      <h1 className="font-display mt-2 text-4xl font-extrabold leading-tight text-ink sm:text-5xl">{s.title(name)}</h1>
      <p className="mt-4 text-neutral-600">{s.text}</p>
      <AnchorButton
        href={whatsappLink(s.waMessage(name))}
        target="_blank"
        rel="noopener noreferrer"
        variant="whatsapp"
        size="lg"
        className="mt-8"
      >
        <MessageCircle size={18} aria-hidden /> {s.ask}
      </AnchorButton>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <LinkButton href="/collections/telephones" variant="outline">
          <Smartphone size={16} aria-hidden /> {s.phones}
        </LinkButton>
        <LinkButton href="/reparation" variant="outline">
          <Wrench size={16} aria-hidden /> {s.repair}
        </LinkButton>
      </div>
    </div>
  );
}
