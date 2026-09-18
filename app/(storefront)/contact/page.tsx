"use client";

import { useState, type FormEvent } from "react";
import { submitContactMessage } from "./actions";

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
        <h1 className="text-2xl font-bold">Message envoyé ✓</h1>
        <p className="mt-3 text-neutral-600">
          Nous vous répondrons rapidement. Pour une réponse immédiate, contactez-nous sur{" "}
          <a href="https://wa.me/212667654430" className="font-medium text-neutral-900 underline decoration-[#c8922a] decoration-2 underline-offset-2">
            WhatsApp
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      <h1 className="text-2xl font-bold">Contactez-nous</h1>
      <p className="mt-2 text-neutral-600">
        Pour une réponse rapide, préférez{" "}
        <a href="https://wa.me/212667654430" className="font-medium text-neutral-900 underline decoration-[#c8922a] decoration-2 underline-offset-2">
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
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <input
          type="tel"
          placeholder="Téléphone (optionnel)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <input
          type="email"
          placeholder="Email (optionnel)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <textarea
          required
          rows={5}
          placeholder="Votre message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded border border-black/20 px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-[#121212] px-4 py-3 font-medium text-white transition-colors hover:bg-[#c8922a] disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
