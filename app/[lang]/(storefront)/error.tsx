"use client";

import { useEffect } from "react";
import { MessageCircle, RotateCw } from "lucide-react";
import { useT } from "@/components/i18n/I18nProvider";
import { AnchorButton, Button } from "@/components/ui/Button";
import { WHATSAPP_URL } from "@/lib/site";

// A page that failed to render (database unreachable, a bug): a calm
// message in the shop's language with a way to retry and a way to reach us,
// instead of a blank or technical screen. The header and tab bar stay.
export default function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  const n = t.notFound;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section role="alert" className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-gold-deep">{n.errorEyebrow}</p>
      <h1 className="font-display mt-3 text-4xl font-extrabold text-ink sm:text-5xl">{n.errorTitle}</h1>
      <p className="mt-4 max-w-md text-lg text-neutral-600">{n.errorText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" variant="accent" onClick={() => reset()}>
          <RotateCw size={18} aria-hidden /> {n.errorRetry}
        </Button>
        <AnchorButton href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" variant="whatsapp">
          <MessageCircle size={18} aria-hidden /> {n.errorWhatsapp}
        </AnchorButton>
      </div>
    </section>
  );
}
