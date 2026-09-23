"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Tag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { submitOrderRequest, confirmWhatsAppOpened, applyPromoCode } from "./actions";
import { ReceiptUpload, type UploadedReceipt } from "@/components/cart/ReceiptUpload";
import { AnchorButton, Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/ui/StepProgress";

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

  const [receipt, setReceipt] = useState<UploadedReceipt | null>(null);
  const [dataConsentAccepted, setDataConsentAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(
    null
  );
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const requiresAdvance = useMemo(() => items.some((item) => item.isPhone), [items]);
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const discountedTotal = Math.max(0, totalPrice - discountAmount);

  async function handleApplyPromo() {
    setPromoError(null);
    setApplyingPromo(true);
    const result = await applyPromoCode(promoInput, items);
    setApplyingPromo(false);

    if (!result.ok) {
      setPromoError(result.error);
      return;
    }
    setAppliedPromo({ code: result.code, discountAmount: result.discountAmount });
    setPromoInput("");
  }

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);

    const result = await submitOrderRequest({
      items,
      customerName,
      customerPhone,
      deliveryAddress,
      notes: notes || undefined,
      receipt: receipt ?? undefined,
      dataConsentAccepted,
      promoCode: appliedPromo?.code,
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
        <CheckCircle2 size={32} className="mx-auto text-green-600" />
        <h1 className="mt-3 text-2xl font-semibold">Demande envoyée</h1>
        <p className="mt-3 text-neutral-600">
          Référence : {confirmation.orderRequestId.slice(0, 8).toUpperCase()}
          <br />
          Appuyez ci-dessous pour finaliser votre commande sur WhatsApp — nous vous répondrons
          rapidement.
        </p>
        <AnchorButton
          href={confirmation.whatsappUrl}
          onClick={() => void confirmWhatsAppOpened(confirmation.orderRequestId)}
          className="mt-6"
        >
          Ouvrir WhatsApp
        </AnchorButton>
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
          className="mt-4 inline-block font-medium text-neutral-900 underline decoration-gold decoration-2 underline-offset-2"
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold sm:text-3xl">Commande</h1>
      <StepProgress step={step + 1} total={3} />

      {/* ── Step 0: cart review ─────────────────────────────────────── */}
      {step === 0 && (
        <>
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId ?? ""}-${item.isGift ? "g" : ""}-${item.bundleId ?? ""}`}
                className="flex items-center gap-4 py-4"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-50">
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
                  <p className="mt-1 inline-block rounded-lg bg-ink px-2 py-0.5 text-sm font-bold text-gold">
                    {formatMAD(item.price)}
                  </p>
                </div>
                {item.isGift || item.bundleId ? (
                  <span className="w-16 text-center text-sm text-neutral-500">×{item.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item, Math.min(20, Math.max(1, Number(e.target.value))))
                    }
                    className="min-h-11 w-16 rounded-lg border border-black/15 px-2 text-center focus:border-gold focus:outline-none"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  aria-label={`Retirer ${item.productName}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-ink"
                >
                  <X size={18} />
                </button>
              </li>
            ))}
          </ul>

          {appliedPromo ? (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Tag size={14} />
                Code {appliedPromo.code} appliqué
              </span>
              <button
                type="button"
                onClick={() => setAppliedPromo(null)}
                className="text-green-700 underline hover:text-green-900"
              >
                Retirer
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Code promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="min-h-11 flex-1 rounded-lg border border-black/15 px-3 uppercase focus:border-gold focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                disabled={applyingPromo || !promoInput.trim()}
                onClick={handleApplyPromo}
              >
                {applyingPromo ? "..." : "Appliquer"}
              </Button>
            </div>
          )}
          {promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}

          <div className="mt-4 space-y-1 border-t border-black/10 pt-4">
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Sous-total</span>
                <span>{formatMAD(totalPrice)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Réduction</span>
                <span>-{formatMAD(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total estimé</span>
              <span>{formatMAD(discountedTotal)}</span>
            </div>
          </div>

          <Button type="button" onClick={() => setStep(1)} className="mt-6 w-full">
            Continuer
          </Button>
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
            className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Numéro de téléphone (ex: 06XXXXXXXX)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold focus:outline-none"
          />
          <textarea
            required
            placeholder="Adresse complète de livraison"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
          />
          <textarea
            placeholder="Notes (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold focus:outline-none"
          />

          <p className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
            Frais de livraison calculés selon votre zone — confirmés par WhatsApp après votre
            commande.
          </p>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
              Retour
            </Button>
            <Button
              type="button"
              disabled={
                !customerName.trim() ||
                !customerPhone.trim() ||
                deliveryAddress.trim().length < 10
              }
              onClick={() => setStep(2)}
              className="flex-1"
            >
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: payment (dynamic) ───────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          {requiresAdvance ? (
            <>
              <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
                <p className="text-sm font-semibold">Avance de réservation : 300 MAD</p>
                <p className="mt-1 text-sm text-neutral-700">
                  Effectuez un virement de 300 MAD, puis déposez le reçu ci-dessous. Le reste du
                  montant ({formatMAD(discountedTotal - 300)}) est payable à la livraison.
                </p>
                <div className="mt-3 rounded-lg bg-white p-3 text-sm shadow-sm">
                  <p>Banque : {BANK_TRANSFER_INFO.bank}</p>
                  <p>RIB / IBAN : {BANK_TRANSFER_INFO.rib}</p>
                  <p>Titulaire : {BANK_TRANSFER_INFO.holder}</p>
                </div>

                <details className="mt-3 rounded-lg bg-white p-3 text-sm shadow-sm">
                  <summary className="cursor-pointer font-medium">Pourquoi cette avance ?</summary>
                  <p className="mt-2 text-neutral-600">
                    Cette avance couvre les frais logistiques et garantit la réservation de votre
                    téléphone le temps de la livraison.
                  </p>
                </details>
              </div>

              <ReceiptUpload onUploadedAction={setReceipt} />

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
            <div className="rounded-xl border border-black/10 p-4">
              <p className="text-sm font-semibold">Paiement à la livraison</p>
              <p className="mt-1 text-sm text-neutral-700">
                Aucune avance requise pour une commande d&apos;accessoires — vous payez à la
                réception.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
              Retour
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={submitting || (requiresAdvance && (!receipt || !dataConsentAccepted))}
              onClick={handleConfirm}
              className="flex-1"
            >
              {submitting ? "Envoi..." : "Confirmer ma commande"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
