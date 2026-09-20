"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitContactMessage } from "./actions";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
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
      setError(result.error);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 size={32} className="mx-auto text-green-600" />
        <h1 className="mt-3 text-2xl font-bold">Message envoyé</h1>
        <p className="mt-3 text-neutral-600">
          Nous vous répondrons rapidement. Pour une réponse immédiate, contactez-nous sur{" "}
          <a href="https://wa.me/212667654430" className="font-semibold text-neutral-900 underline decoration-[#25D366] decoration-2 underline-offset-2">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-bold sm:text-3xl">Contactez-nous</h1>
      <p className="mt-3 text-neutral-600">
        Pour une réponse rapide, préférez{" "}
        <a href="https://wa.me/212667654430" className="font-semibold text-neutral-900 underline decoration-[#25D366] decoration-2 underline-offset-2">
          WhatsApp
        </a>
        . Sinon, écrivez-nous ici.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="text"
          required
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-11 w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
        />
        <p className="-mt-2 text-xs text-neutral-500">
          Indiquez au moins l&apos;un des deux, pour qu&apos;on puisse vous répondre.
        </p>
        <textarea
          required
          rows={5}
          placeholder="Votre message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={submitting || (!phone.trim() && !email.trim())} className="w-full">
          {submitting ? "Envoi..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
