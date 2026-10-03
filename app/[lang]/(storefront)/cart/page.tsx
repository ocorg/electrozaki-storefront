"use client";

import { useState, useMemo } from "react";
import Link from "@/components/i18n/Link";
import Image from "next/image";
import { CheckCircle2, ShoppingBag, Tag, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { submitOrderRequest, confirmWhatsAppOpened, applyPromoCode } from "./actions";
import { ReceiptUpload, type UploadedReceipt } from "@/components/cart/ReceiptUpload";
import { AnchorButton, Button, LinkButton } from "@/components/ui/Button";
import { StepProgress } from "@/components/ui/StepProgress";
import { DeliveryPicker } from "@/components/cart/DeliveryPicker";
import { findCity } from "@/lib/delivery";
import { metaTrack } from "@/components/analytics/meta";
import { useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";

// The phone reservation advance, in DH (the server applies the same rule).
const ADVANCE = 300;

type Confirmation = { orderRequestId: string; whatsappUrl: string };

// TODO before going live: replace with your real bank account details.
const BANK_TRANSFER_INFO = {
  bank: "[À COMPLÉTER - nom de la banque]",
  rib: "[À COMPLÉTER - RIB / IBAN]",
  holder: "[À COMPLÉTER - titulaire du compte]",
};

export default function CartPage() {
  const t = useT();
  const c = t.cartPage;
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState<string | null>(null);
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
  // Display only — the server recomputes the fee from the city at submission.
  const deliveryFee = findCity(deliveryCity)?.fee ?? 0;
  const discountedTotal = Math.max(0, totalPrice - discountAmount) + deliveryFee;

  async function handleApplyPromo() {
    setPromoError(null);
    setApplyingPromo(true);
    const result = await applyPromoCode(promoInput, items);
    setApplyingPromo(false);

    if (!result.ok) {
      setPromoError(translateError(t, result.error));
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
      deliveryCity: deliveryCity ?? "",
      notes: notes || undefined,
      receipt: receipt ?? undefined,
      dataConsentAccepted,
      promoCode: appliedPromo?.code,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(translateError(t, result.error));
      return;
    }

    // An order placed (paid on delivery): Meta's "Purchase", for ad optimisation.
    metaTrack(
      "Purchase",
      { value: discountedTotal, content_ids: items.map((i) => i.productId), content_type: "product", num_items: items.reduce((n, i) => n + i.quantity, 0) },
      result.orderRequestId
    );
    setConfirmation(result);
    clear();
  }

  // ── Confirmation screen ──────────────────────────────────────────────
  if (confirmation) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle2 size={32} className="mx-auto text-green-600" />
        <h1 className="mt-3 text-2xl font-semibold">{c.sentTitle}</h1>
        <p className="mt-3 text-neutral-600">
          {c.reference(confirmation.orderRequestId.slice(0, 8).toUpperCase())}
          <br />
          {c.finishOnWhatsapp}
        </p>
        <AnchorButton
          href={confirmation.whatsappUrl}
          onClick={() => void confirmWhatsAppOpened(confirmation.orderRequestId)}
          className="mt-6"
        >
          {c.openWhatsapp}
        </AnchorButton>
        <div className="mt-6">
          <Link href="/" className="text-sm text-neutral-500 underline">
            {c.backHome}
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-[30%] bg-white ring-1 ring-ink/10">
          <ShoppingBag size={34} className="text-ink" aria-hidden />
        </span>
        <h1 className="font-display mt-6 text-4xl font-extrabold text-ink">{c.emptyTitle}</h1>
        <p className="mt-3 text-neutral-600">{c.emptyText}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/collections/telephones" variant="accent">
            {c.seePhones}
          </LinkButton>
          <LinkButton href="/collections/accessoires" variant="outline">
            {t.common.accessories}
          </LinkButton>
        </div>
        <Link href="/" className="mt-5 text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
          {c.backHome}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold sm:text-3xl">{c.title}</h1>
      <StepProgress step={step + 1} total={3} />

      {/* ── Step 0: cart review ─────────────────────────────────────── */}
      {step === 0 && (
        <>
          <ul className="divide-y divide-black/10 border-y border-black/10">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.variantId ?? ""}-${item.isGift ? "g" : ""}-${item.bundleId ?? ""}-${item.landingId ?? ""}`}
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
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-sm text-neutral-500">{item.variantName}</p>
                  )}
                  <p className="mt-1 inline-block rounded-lg bg-ink px-2 py-0.5 text-sm font-bold text-gold">
                    {formatMAD(item.price)}
                  </p>
                </div>
                {item.isGift || item.bundleId ? (
                  <span dir="ltr" className="w-16 text-center text-sm text-neutral-500">×{item.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    aria-label={c.quantityOf(item.productName)}
                    onChange={(e) =>
                      updateQuantity(item, Math.min(20, Math.max(1, Number(e.target.value))))
                    }
                    className="min-h-11 w-16 rounded-lg border border-black/15 px-2 text-center focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item)}
                  aria-label={c.removeItem(item.productName)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 hover:text-ink"
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
                {c.promoApplied(appliedPromo.code)}
              </span>
              <button
                type="button"
                onClick={() => setAppliedPromo(null)}
                className="text-green-700 underline hover:text-green-900"
              >
                {c.remove}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder={c.promoPlaceholder}
                dir="ltr"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="min-h-11 flex-1 rounded-lg border border-black/15 px-3 uppercase focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <Button
                type="button"
                variant="outline"
                disabled={applyingPromo || !promoInput.trim()}
                onClick={handleApplyPromo}
              >
                {applyingPromo ? "…" : c.apply}
              </Button>
            </div>
          )}
          {promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}

          <div className="mt-4 space-y-1 border-t border-black/10 pt-4">
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-neutral-600">
                <span>{c.subtotal}</span>
                <span>{formatMAD(totalPrice)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>{c.discount}</span>
                <span dir="ltr">-{formatMAD(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-neutral-600">
              <span>{c.delivery}{deliveryCity ? ` (${deliveryCity})` : ""}</span>
              <span>{deliveryCity ? formatMAD(deliveryFee) : c.deliveryNext}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>{c.estimatedTotal}</span>
              <span>{formatMAD(discountedTotal)}</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => {
              metaTrack("InitiateCheckout", { value: totalPrice, num_items: items.reduce((n, i) => n + i.quantity, 0) });
              setStep(1);
            }}
            className="mt-6 w-full"
          >
            {c.next}
          </Button>
        </>
      )}

      {/* ── Step 1: delivery info ───────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4">
          <input
            type="text"
            required
            placeholder={c.fullName}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <input
            type="tel"
            required
            placeholder={c.phone}
            dir="ltr"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="min-h-11 w-full rounded-lg border border-black/15 px-3 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <DeliveryPicker value={deliveryCity} onChangeAction={setDeliveryCity} />
          <textarea
            required
            placeholder={c.address}
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <textarea
            placeholder={c.notes}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-black/15 px-3 py-2 focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
          />

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
              {c.back}
            </Button>
            <Button
              type="button"
              disabled={
                !customerName.trim() ||
                !customerPhone.trim() ||
                !deliveryCity ||
                deliveryAddress.trim().length < 10
              }
              onClick={() => setStep(2)}
              className="flex-1"
            >
              {c.next}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: payment (dynamic) ───────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1 rounded-xl border border-black/10 p-4 text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>{c.items}{discountAmount > 0 ? c.afterDiscount : ""}</span>
              <span>{formatMAD(Math.max(0, totalPrice - discountAmount))}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>{c.delivery} ({deliveryCity})</span>
              <span>{formatMAD(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-1 text-base font-semibold">
              <span>{c.total}</span>
              <span>{formatMAD(discountedTotal)}</span>
            </div>
          </div>
          {requiresAdvance ? (
            <>
              <div className="rounded-xl border border-gold/40 bg-gold/5 p-4">
                <p className="text-sm font-semibold">{c.advanceTitle(formatMAD(ADVANCE))}</p>
                <p className="mt-1 text-sm text-neutral-700">
                  {c.advanceText(formatMAD(ADVANCE), formatMAD(discountedTotal - ADVANCE))}
                </p>
                <div className="mt-3 rounded-lg bg-white p-3 text-sm shadow-sm">
                  <p>{c.bank} : {BANK_TRANSFER_INFO.bank}</p>
                  <p>
                    {c.rib} : <span dir="ltr">{BANK_TRANSFER_INFO.rib}</span>
                  </p>
                  <p>{c.holder} : {BANK_TRANSFER_INFO.holder}</p>
                </div>

                <details className="mt-3 rounded-lg bg-white p-3 text-sm shadow-sm">
                  <summary className="cursor-pointer font-medium">{c.whyAdvance}</summary>
                  <p className="mt-2 text-neutral-600">
                    {c.whyAdvanceText}
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
                  {c.consent}
                </span>
              </label>
            </>
          ) : (
            <div className="rounded-xl border border-black/10 p-4">
              <p className="text-sm font-semibold">{c.codTitle}</p>
              <p className="mt-1 text-sm text-neutral-700">
                {c.codText}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
              {c.back}
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={submitting || (requiresAdvance && (!receipt || !dataConsentAccepted))}
              onClick={handleConfirm}
              className="flex-1"
            >
              {submitting ? c.sending : c.confirm}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
