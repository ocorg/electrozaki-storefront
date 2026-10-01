"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitContactMessage } from "./actions";
import { Button } from "@/components/ui/Button";
import { WHATSAPP_URL } from "@/lib/site";
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
    setError(null);
    setSubmitting(true);

    const result = await submitContactMessage({
      name,
      phone: phone || undefined,
      email: email || undefined,
      message,
    });

    setSubmitting(false);

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
    <div className="mx-auto max-w-lg px-4 py-16">
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting || (!phone.trim() && !email.trim())} className="w-full">
          {submitting ? c.sending : c.send}
        </Button>
      </form>
    </div>
  );
}
