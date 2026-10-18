"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock, MapPin, MessageCircle, Navigation } from "lucide-react";
import { submitContactMessage } from "./actions";
import { Button } from "@/components/ui/Button";
import { SocialLinks } from "@/components/storefront/SocialLinks";
import { SHOP, WHATSAPP_URL } from "@/lib/site";
import { useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";

export default function ContactPage() {
  const t = useT();
  const c = t.contact;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No way to answer: say so (instead of a dead button).
    if (!phone.trim() && !email.trim()) {
      setError(c.oneOfTwo);
      return;
    }
    setError(null);
    setSubmitting(true);

    const result = await submitContactMessage({
      name,
      phone: phone || undefined,
      email: email || undefined,
      message,
    }).catch(() => null);

    setSubmitting(false);
    if (!result) {
      setError(t.errors.network);
      return;
    }

    if (!result.ok) {
      setError(translateError(t, result.error));
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 size={32} className="mx-auto text-green-600" />
        <h1 className="mt-3 text-2xl font-bold">{c.sentTitle}</h1>
        <p className="mt-3 text-neutral-600">
          {c.sentBefore}{" "}
          <a href={WHATSAPP_URL} className="font-semibold text-neutral-900 underline decoration-whatsapp decoration-2 underline-offset-2">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div data-no-floating-wa className="mx-auto grid max-w-5xl gap-10 px-4 py-12 sm:py-16 md:grid-cols-2">
      {/* The shop: customers like to know it exists before paying an advance. */}
      <section id="boutique" aria-labelledby="shop-title" className="scroll-mt-28">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-gold-deep">{SHOP.city}</p>
        <h2 id="shop-title" className="font-display mt-1 text-2xl font-bold text-ink sm:text-3xl">{c.shopTitle}</h2>
        <p className="mt-3 text-neutral-600">{c.shopIntro}</p>
        <div className="mt-5 overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <iframe
            src={SHOP.mapEmbed}
            title={c.mapTitle}
            className="block aspect-4/3 w-full border-0"
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <a
            href={SHOP.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-3"
          >
            <Navigation size={17} aria-hidden /> {c.directions}
          </a>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-ink"
          >
            <MessageCircle size={17} aria-hidden /> <span dir="ltr">{SHOP.whatsappDisplay}</span>
          </a>
        </div>
        <div className="mt-5 grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-ink/7 sm:grid-cols-2">
          <div className="flex gap-3">
            <MapPin size={18} aria-hidden className="mt-0.5 flex-none text-gold-deep" />
            <p className="text-sm">
              <span className="block font-semibold text-ink">{c.address}</span>
              <span className="text-neutral-600">{c.landmark}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Clock size={18} aria-hidden className="mt-0.5 flex-none text-gold-deep" />
            <div className="text-sm">
              <p className="font-semibold text-ink">{c.hoursTitle}</p>
              {c.hours.map((line) => (
                <p key={line} className="text-neutral-600">{line}</p>
              ))}
            </div>
          </div>
        </div>
        <SocialLinks className="mt-4" />
      </section>

      <div>
      <h1 className="text-2xl font-bold sm:text-3xl">{c.title}</h1>
      <p className="mt-3 text-neutral-600">
        {c.introBefore}{" "}
        <a href={WHATSAPP_URL} className="font-semibold text-neutral-900 underline decoration-whatsapp decoration-2 underline-offset-2">
          WhatsApp
        </a>
        {c.introAfter}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="text"
          required
          placeholder={c.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <input
          type="tel"
          placeholder={c.phone}
          dir="ltr"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <input
          type="email"
          placeholder={c.email}
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <p className="-mt-2 text-xs text-neutral-500">
          {c.oneOfTwo}
        </p>
        <textarea
          required
          rows={5}
          placeholder={c.message}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
        />

        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} className="w-full">
          {submitting ? c.sending : c.send}
        </Button>
      </form>
      </div>
    </div>
  );
}
