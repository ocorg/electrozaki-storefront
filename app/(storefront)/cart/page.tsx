"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { submitOrderRequest, confirmWhatsAppOpened } from "./actions";
import { ReceiptUpload } from "@/components/cart/ReceiptUpload";

type Confirmation = { orderRequestId: string; whatsappUrl: string };

// TODO before going live: replace with your real bank account details.
const BANK_TRANSFER_INFO = {
  bank: "[À COMPLÉTER — nom de la banque]",
  rib: "[À COMPLÉTER — RIB / IBAN]",
  holder: "[À COMPLÉTER — titulaire du compte]",
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [dataConsentAccepted, setDataConsentAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const requiresAdvance = useMemo(() => items.some((item) => item.isPhone), [items]);

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);

    const result = await submitOrderRequest({
      items,
      customerName,
      customerPhone,
      deliveryAddress,
      notes: notes || undefined,
      requiresAdvance,
      receiptUrl: receiptUrl ?? undefined,
      dataConsentAccepted,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setConfirmation(result);
    clear();
  }

  // ── Confirmation screen ──────────────────────────────────────────────
  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">Demande envoyée ✓</h1>
        <p className="mt-3 text-neutral-600">
          Référence : {confirmation.orderRequestId.slice(0, 8).toUpperCase()}
          <br />
          Appuyez ci-dessous pour finaliser votre commande sur WhatsApp — nous vous répondrons
          rapidement.
        </p>
        <a
          href={confirmation.whatsappUrl}
          onClick={() => void confirmWhatsAppOpened(confirmation.orderRequestId)}
          className="mt-6 inline-block rounded bg-[#121212] px-6 py-3 font-medium text-white transition-colors hover:bg-[#c8922a] hover:text-black"
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

  const stepLabels = ["Panier", "Livraison", "Paiement"];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-semibold">Commande</h1>
      <p className="mb-6 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Étape {step + 1} / 3 — {stepLabels[step]}
      </p>

      {/* ── Step 0: cart review ─────────────────────────────────────── */}
      {step === 0 && (
        <>
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

          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-6 min-h-11 w-full rounded bg-[#121212] px-4 text-sm font-semibold text-white"
          >
            Continuer
          </button>
        </>
      )}

      {/* ── Step 1: delivery info ───────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            required
            placeholder="Nom complet"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="min-h-11 w-full rounded border border-black/20 px-3"
          />
          <input
            type="tel"
            required
            placeholder="Numéro de téléphone (ex: 06XXXXXXXX)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="min-h-11 w-full rounded border border-black/20 px-3"
          />
          <textarea
            required
            placeholder="Adresse complète de livraison"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            className="w-full rounded border border-black/20 px-3 py-2"
          />
          <textarea
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded border border-black/20 px-3 py-2"
          />

          <p className="rounded bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
            Frais de livraison calculés selon votre zone — confirmés par WhatsApp après votre
            commande.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="min-h-11 flex-1 rounded border border-black/20 px-4 text-sm"
            >
              Retour
            </button>
            <button
              type="button"
              disabled={
                !customerName.trim() ||
                !customerPhone.trim() ||
                deliveryAddress.trim().length < 10
              }
              onClick={() => setStep(2)}
              className="min-h-11 flex-1 rounded bg-[#121212] px-4 text-sm font-semibold text-white disabled:opacity-40"
            >
              Continuer
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: payment (dynamic) ───────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {requiresAdvance ? (
            <>
              <div className="rounded-lg border border-[#c8922a]/40 bg-[#c8922a]/5 p-4">
                <p className="text-sm font-semibold">Avance de réservation : 300 MAD</p>
                <p className="mt-1 text-sm text-neutral-700">
                  Effectuez un virement de 300 MAD, puis déposez le reçu ci-dessous. Le reste du
                  montant ({formatMAD(totalPrice - 300)}) est payable à la livraison.
                </p>
                <div className="mt-3 rounded bg-white p-3 text-sm">
                  <p>Banque : {BANK_TRANSFER_INFO.bank}</p>
                  <p>RIB / IBAN : {BANK_TRANSFER_INFO.rib}</p>
                  <p>Titulaire : {BANK_TRANSFER_INFO.holder}</p>
                </div>

                <details className="mt-3 rounded bg-white p-3 text-sm">
                  <summary className="cursor-pointer font-medium">Pourquoi cette avance ?</summary>
                  <p className="mt-2 text-neutral-600">
                    Cette avance couvre les frais logistiques et garantit la réservation de votre
                    téléphone le temps de la livraison.
                  </p>
                </details>
              </div>

              <ReceiptUpload onUploaded={setReceiptUrl} />

              <label className="flex items-start gap-2 text-xs text-neutral-600">
                <input
                  type="checkbox"
                  checked={dataConsentAccepted}
                  onChange={(e) => setDataConsentAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4"
                />
                <span>
                  J&apos;accepte que mes données et mon reçu bancaire soient traités de manière
                  confidentielle, conformément à la réglementation CNDP.
                </span>
              </label>
            </>
          ) : (
            <div className="rounded-lg border border-black/10 p-4">
              <p className="text-sm font-semibold">Paiement à la livraison</p>
              <p className="mt-1 text-sm text-neutral-700">
                Aucune avance requise pour une commande d&apos;accessoires — vous payez à la
                réception.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-11 flex-1 rounded border border-black/20 px-4 text-sm"
            >
              Retour
            </button>
            <button
              type="button"
              disabled={
                submitting || (requiresAdvance && (!receiptUrl || !dataConsentAccepted))
              }
              onClick={handleConfirm}
              className="min-h-11 flex-1 rounded bg-[#c8922a] px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Envoi..." : "Confirmer ma commande"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
