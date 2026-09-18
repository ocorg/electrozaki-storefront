"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { submitOrderRequest, confirmWhatsAppOpened } from "./actions";

type Confirmation = { orderRequestId: string; whatsappUrl: string };

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await submitOrderRequest({
      items,
      customerName,
      customerPhone,
      notes: notes || undefined,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setConfirmation(result);
    clear();
  }

  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Demande envoyée ✓</h1>
        <p className="mt-3 text-neutral-600">
          Référence : {confirmation.orderRequestId.slice(0, 8).toUpperCase()}
          <br />
          Appuyez ci-dessous pour finaliser votre commande sur WhatsApp — nous
          vous répondrons rapidement.
        </p>
        <a
          href={confirmation.whatsappUrl}
          onClick={() => {
            // Best-effort — a slow or failed request here should never
            // block the customer from reaching WhatsApp.
            void confirmWhatsAppOpened(confirmation.orderRequestId);
          }}
          className="mt-6 inline-block rounded bg-[#121212] px-6 py-3 font-medium text-white transition-colors hover:bg-[#c8922a]"
        >
          Ouvrir WhatsApp
        </a>
        <div className="mt-6">
          <Link href="/" className="text-sm text-neutral-500 underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Votre panier est vide</h1>
        <Link
          href="/"
          className="mt-4 inline-block font-medium text-neutral-900 underline decoration-[#c8922a] decoration-2 underline-offset-2"
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Mon panier</h1>

      <ul className="divide-y divide-black/10 border-y border-black/10">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.variantId ?? ""}`}
            className="flex items-center gap-4 py-4"
          >
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-50">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.productName}
                  fill
                  className="object-contain p-1"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{item.productName}</p>
              {item.variantName && (
                <p className="text-sm text-neutral-500">{item.variantName}</p>
              )}
              <p className="mt-1 inline-block rounded bg-[#121212] px-2 py-0.5 text-sm font-bold text-[#c8922a]">
                {formatMAD(item.price)}
              </p>
            </div>
            <input
              type="number"
              min={1}
              value={item.quantity}
              onChange={(e) =>
                updateQuantity(
                  item.productId,
                  Math.max(1, Number(e.target.value)),
                  item.variantId
                )
              }
              className="min-h-11 w-16 rounded border border-black/20 px-2 text-center"
            />
            <button
              type="button"
              onClick={() => removeItem(item.productId, item.variantId)}
              className="min-h-11 px-2 text-sm text-neutral-400 hover:text-black"
            >
              Retirer
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between text-lg font-semibold">
        <span>Total estimé</span>
        <span>{formatMAD(totalPrice)}</span>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <h2 className="text-lg font-medium">Vos coordonnées</h2>

        <input
          type="text"
          required
          placeholder="Nom complet"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <input
          type="tel"
          required
          placeholder="Numéro de téléphone (ex: 06XXXXXXXX)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="w-full rounded border border-black/20 px-3 py-2"
        />
        <textarea
          placeholder="Notes (optionnel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded border border-black/20 px-3 py-2"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-[#121212] px-4 py-3 font-medium text-white transition-colors hover:bg-[#c8922a] disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Commander via WhatsApp"}
        </button>
      </form>
    </div>
  );
}
