"use client";
import { ACCESSORIES_OPEN } from "@/lib/site";

import { useState, useMemo, useRef, type ReactNode } from "react";
import Link from "@/components/i18n/Link";
import Image from "next/image";
import { AlertCircle, Check, MessageCircle, Phone, ShoppingBag, Tag, Truck, Wallet, X } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { formatMAD } from "@/lib/format";
import { submitOrderRequest, confirmWhatsAppOpened, applyPromoCode } from "./actions";
import { ReceiptUpload, type UploadedReceipt } from "@/components/cart/ReceiptUpload";
import { PaymentAccounts } from "@/components/cart/PaymentAccounts";
import { CheckoutJourney } from "@/components/cart/CheckoutJourney";
import { AnchorButton, Button, LinkButton } from "@/components/ui/Button";
import { DeliveryPicker } from "@/components/cart/DeliveryPicker";
import { dayParts, estimateDelivery, findCity } from "@/lib/delivery";
import { MOROCCAN_PHONE_RE } from "@/lib/validation";
import { catalogId, metaTrack } from "@/components/analytics/meta";
import { useT } from "@/components/i18n/I18nProvider";
import { translateError } from "@/lib/i18n/labels";

// The phone reservation advance, in DH (the server applies the same rule).
const ADVANCE = 300;

type Confirmation = { orderRequestId: string; whatsappUrl: string };

// What each step needs before the customer may move on. The server checks
// the same rules again (lib/validation.ts); these only say so earlier.
type DeliveryField = "name" | "phone" | "city" | "address";
type PaymentField = "receipt" | "consent";

const inputClass = (invalid: boolean) =>
  `min-h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] transition-colors focus:outline-none focus:ring-2 ${
    invalid ? "border-red-500 focus:border-red-600 focus:ring-red-200" : "border-black/15 focus:border-gold-deep focus:ring-gold/30"
  }`;

export default function CartPage() {
  const t = useT();
  const c = t.cartPage;
  const k = t.checkout;
  const { items, updateQuantity, removeItem, totalPrice, clear } = useCart();

  const [step, setStep] = useState<0 | 1 | 2>(0);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const [receipt, setReceipt] = useState<UploadedReceipt | null>(null);
  const [dataConsentAccepted, setDataConsentAccepted] = useState(false);

  // Missing information is pointed out only once the customer tries to go on.
  const [triedDelivery, setTriedDelivery] = useState(false);
  const [triedPayment, setTriedPayment] = useState(false);
  const fieldRefs = useRef<Partial<Record<DeliveryField | PaymentField, HTMLElement | null>>>({});

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountAmount: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const requiresAdvance = useMemo(() => items.some((item) => item.isPhone), [items]);
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  // Display only — the server recomputes the fee from the city at submission.
  const city = findCity(deliveryCity);
  const deliveryFee = city?.fee ?? 0;
  const discountedTotal = Math.max(0, totalPrice - discountAmount) + deliveryFee;

  const estimate = city ? estimateDelivery(city) : null;
  const arrival =
    estimate && estimate.deliverable
      ? (() => {
          const p = dayParts(estimate.deliveryDate);
          return t.delivery.date(t.delivery.weekdays[p.weekday], p.day, t.delivery.months[p.month]);
        })()
      : null;

  const deliveryChecks: Record<DeliveryField, boolean> = {
    name: customerName.trim().length >= 2,
    phone: MOROCCAN_PHONE_RE.test(customerPhone.trim()),
    city: Boolean(city),
    address: deliveryAddress.trim().length >= 10,
  };
  const paymentChecks: Record<PaymentField, boolean> = {
    receipt: !requiresAdvance || Boolean(receipt),
    consent: !requiresAdvance || dataConsentAccepted,
  };
  const missingDelivery = (Object.keys(deliveryChecks) as DeliveryField[]).filter((f) => !deliveryChecks[f]);
  const missingPayment = (Object.keys(paymentChecks) as PaymentField[]).filter((f) => !paymentChecks[f]);

  function focusFirst(field: DeliveryField | PaymentField | undefined) {
    const el = field ? fieldRefs.current[field] : null;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true });
  }

  function goTo(next: 0 | 1 | 2) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  async function handleApplyPromo() {
    setPromoError(null);
    setApplyingPromo(true);
    const result = await applyPromoCode(promoInput, items).catch(() => null);
    setApplyingPromo(false);
    if (!result) {
      setPromoError(t.errors.network);
      return;
    }

    if (!result.ok) {
      setPromoError(translateError(t, result.error));
      return;
    }
    setAppliedPromo({ code: result.code, discountAmount: result.discountAmount });
    setPromoInput("");
  }

  function continueToPayment() {
    setTriedDelivery(true);
    if (missingDelivery.length) {
      focusFirst(missingDelivery[0]);
      return;
    }
    goTo(2);
  }

  async function handleConfirm() {
    setTriedPayment(true);
    if (missingPayment.length) {
      focusFirst(missingPayment[0]);
      return;
    }
    setError(null);
    setSubmitting(true);

    // No answer (connection lost): say so, instead of a button stuck on
    // "sending" forever.
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

    // An order placed (paid on delivery): Meta's "Purchase", for ad optimisation.
    metaTrack(
      "Purchase",
      { value: discountedTotal, content_ids: items.map(catalogId), content_type: "product", num_items: items.reduce((n, i) => n + i.quantity, 0) },
      // The public reference, not the internal id (Meta is a third party).
      result.orderRequestId.slice(0, 8).toUpperCase()
    );
    setConfirmation(result);
    clear();
  }

  // ── Confirmation screen ──────────────────────────────────────────────
  if (confirmation) {
    const next = [
      { icon: MessageCircle, text: k.done.steps[0] },
      { icon: Phone, text: k.done.steps[1] },
      { icon: Truck, text: arrival ? k.done.arrives(arrival) : k.done.steps[2] },
    ];
    return (
      <div className="mx-auto max-w-lg px-4 py-14 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-signal text-white shadow-[0_14px_30px_-14px_rgb(31_122_69/0.9)]">
          <Check size={30} strokeWidth={3} aria-hidden />
        </span>
        <h1 className="font-display mt-5 text-3xl font-extrabold text-ink">{c.sentTitle}</h1>
        <p className="readout mt-2 text-sm font-semibold text-neutral-600">
          {c.reference(confirmation.orderRequestId.slice(0, 8).toUpperCase())}
        </p>
        <p className="mt-4 text-neutral-600">{c.finishOnWhatsapp}</p>
        <AnchorButton
          href={confirmation.whatsappUrl}
          onClick={() => void confirmWhatsAppOpened(confirmation.orderRequestId)}
          variant="whatsapp"
          className="mt-6 w-full sm:w-auto"
        >
          <MessageCircle size={18} aria-hidden /> {c.openWhatsapp}
        </AnchorButton>

        <ol className="mt-8 space-y-2 text-start">
          {next.map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-ink/7">
              <span className="readout flex h-8 w-8 flex-none items-center justify-center rounded-full bg-paper text-ink">
                <Icon size={16} aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link
            href={`/commande/suivi?ref=${confirmation.orderRequestId.slice(0, 8).toUpperCase()}`}
            className="text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4"
          >
            {t.orderTracking.success}
          </Link>
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
          {ACCESSORIES_OPEN ? (
            <LinkButton href="/collections/accessoires" variant="outline">
            {t.common.accessories}
          </LinkButton>
          ) : (
            <LinkButton href="/reparation" variant="outline">
              {t.common.repair}
            </LinkButton>
          )}
        </div>
        <Link href="/" className="mt-5 text-sm font-semibold text-ink underline decoration-gold decoration-2 underline-offset-4">
          {c.backHome}
        </Link>
      </div>
    );
  }

  const deliveryDone = (Object.values(deliveryChecks) as boolean[]).filter(Boolean).length;
  const showDeliveryError = (f: DeliveryField) => triedDelivery && !deliveryChecks[f];
  const showPaymentError = (f: PaymentField) => triedPayment && !paymentChecks[f];

  return (
    <div data-checkout className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display mb-5 text-3xl font-extrabold text-ink sm:text-4xl">{c.title}</h1>
      <CheckoutJourney step={step} onStepAction={goTo} arrival={arrival} />

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
                  {item.image && <Image src={item.image} alt={item.productName} fill className="object-contain p-1" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.productName}</p>
                  {item.variantName && <p className="text-sm text-neutral-500">{item.variantName}</p>}
                  <p className="mt-1 inline-block rounded-lg bg-ink px-2 py-0.5 text-sm font-bold text-gold">{formatMAD(item.price)}</p>
                </div>
                {item.isGift || item.bundleId ? (
                  <span dir="ltr" className="w-16 text-center text-sm text-neutral-500">
                    ×{item.quantity}
                  </span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    aria-label={c.quantityOf(item.productName)}
                    onChange={(e) => updateQuantity(item, Math.min(20, Math.max(1, Number(e.target.value))))}
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
              <button type="button" onClick={() => setAppliedPromo(null)} className="text-green-700 underline hover:text-green-900">
                {c.remove}
              </button>
            </div>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder={c.promoPlaceholder}
                aria-label={c.promoPlaceholder}
                dir="ltr"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                className="min-h-11 flex-1 rounded-lg border border-black/15 px-3 uppercase focus:border-gold-deep focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <Button type="button" variant="outline" loading={applyingPromo} disabled={!promoInput.trim()} onClick={handleApplyPromo}>
                {c.apply}
              </Button>
            </div>
          )}
          {promoError && (
            <p role="alert" className="mt-2 text-sm text-red-700">
              {promoError}
            </p>
          )}

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
              <span>
                {c.delivery}
                {deliveryCity ? ` (${deliveryCity})` : ""}
              </span>
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
              goTo(1);
            }}
            className="mt-6 w-full"
          >
            {c.next}
          </Button>
        </>
      )}

      {/* ── Step 1: delivery info ───────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <Field
            id="checkout-name"
            label={k.fields.name}
            error={showDeliveryError("name") ? k.errors.name : null}
            ok={deliveryChecks.name}
          >
            <input
              id="checkout-name"
              ref={(el) => {
                fieldRefs.current.name = el;
              }}
              type="text"
              autoComplete="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              aria-invalid={showDeliveryError("name")}
              aria-describedby={showDeliveryError("name") ? "checkout-name-error" : undefined}
              className={inputClass(showDeliveryError("name"))}
            />
          </Field>

          <Field
            id="checkout-phone"
            label={k.fields.phone}
            hint={k.fields.phoneHint}
            error={showDeliveryError("phone") ? k.errors.phone : null}
            ok={deliveryChecks.phone}
          >
            <input
              id="checkout-phone"
              ref={(el) => {
                fieldRefs.current.phone = el;
              }}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="06 12 34 56 78"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              aria-invalid={showDeliveryError("phone")}
              aria-describedby={showDeliveryError("phone") ? "checkout-phone-error" : "checkout-phone-hint"}
              className={inputClass(showDeliveryError("phone"))}
            />
          </Field>

          <div
            ref={(el) => {
              fieldRefs.current.city = el;
            }}
            className={`scroll-mt-28 rounded-2xl ${showDeliveryError("city") ? "p-3 ring-2 ring-red-500" : ""}`}
          >
            <DeliveryPicker value={deliveryCity} onChangeAction={setDeliveryCity} />
            {showDeliveryError("city") && <FieldError id="checkout-city-error">{k.errors.city}</FieldError>}
          </div>

          <Field
            id="checkout-address"
            label={k.fields.address}
            hint={k.fields.addressHint}
            error={showDeliveryError("address") ? k.errors.address : null}
            ok={deliveryChecks.address}
          >
            <textarea
              id="checkout-address"
              ref={(el) => {
                fieldRefs.current.address = el;
              }}
              autoComplete="street-address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={3}
              aria-invalid={showDeliveryError("address")}
              aria-describedby={showDeliveryError("address") ? "checkout-address-error" : "checkout-address-hint"}
              className={`${inputClass(showDeliveryError("address"))} py-2.5`}
            />
          </Field>

          <Field id="checkout-notes" label={k.fields.notes} error={null}>
            <textarea
              id="checkout-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={`${inputClass(false)} py-2.5`}
            />
          </Field>

          {/* How much is filled in, and what is still missing once they tried. */}
          <div aria-live="polite">
            {triedDelivery && missingDelivery.length > 0 ? (
              <MissingBanner text={k.missing(missingDelivery.map((f) => k.missingNames[f]))} />
            ) : (
              <p className="flex items-center gap-2 text-sm text-neutral-600">
                <span className="flex gap-1" aria-hidden>
                  {(Object.values(deliveryChecks) as boolean[]).map((ok, i) => (
                    <span key={i} className={`h-1.5 w-6 rounded-full transition-colors ${ok ? "bg-signal" : "bg-ink/12"}`} />
                  ))}
                </span>
                <span className="readout font-semibold">{k.progress(deliveryDone, 4)}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => goTo(0)} className="flex-1">
              {c.back}
            </Button>
            <Button type="button" onClick={continueToPayment} className="flex-1">
              {c.next}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: payment (dynamic) ───────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-1 rounded-2xl bg-white p-4 text-sm ring-1 ring-ink/7">
            <div className="flex justify-between text-neutral-600">
              <span>
                {c.items}
                {discountAmount > 0 ? c.afterDiscount : ""}
              </span>
              <span>{formatMAD(Math.max(0, totalPrice - discountAmount))}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>
                {c.delivery} ({deliveryCity})
              </span>
              <span>{formatMAD(deliveryFee)}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-1 text-base font-semibold">
              <span>{c.total}</span>
              <span>{formatMAD(discountedTotal)}</span>
            </div>
            {arrival && (
              <p className="flex items-center gap-2 pt-2 text-[13px] text-signal">
                <Truck size={15} aria-hidden /> {k.journey.arrivalBefore} <b>{arrival}</b>
              </p>
            )}
          </div>

          {requiresAdvance ? (
            <>
              <div className="rounded-2xl border border-gold/40 bg-gold/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Wallet size={16} className="text-gold-deep" aria-hidden />
                  {c.advanceTitle(formatMAD(ADVANCE))}
                </p>
                <p className="mt-1 text-sm text-neutral-700">{c.advanceText(formatMAD(ADVANCE), formatMAD(discountedTotal - ADVANCE))}</p>
                <PaymentAccounts />

                <details className="mt-3 rounded-lg bg-white p-3 text-sm shadow-sm">
                  <summary className="cursor-pointer font-medium">{c.whyAdvance}</summary>
                  <p className="mt-2 text-neutral-600">{c.whyAdvanceText}</p>
                </details>
              </div>

              <div
                ref={(el) => {
                  fieldRefs.current.receipt = el;
                }}
                className={`scroll-mt-28 rounded-2xl ${showPaymentError("receipt") ? "p-2 ring-2 ring-red-500" : ""}`}
              >
                <ReceiptUpload onUploadedAction={setReceipt} />
                {showPaymentError("receipt") && <FieldError id="checkout-receipt-error">{k.errors.receipt}</FieldError>}
              </div>

              <div
                ref={(el) => {
                  fieldRefs.current.consent = el;
                }}
                className="scroll-mt-28"
              >
                <label
                  className={`flex items-start gap-2.5 rounded-xl p-2 text-xs text-neutral-600 ${showPaymentError("consent") ? "ring-2 ring-red-500" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={dataConsentAccepted}
                    onChange={(e) => setDataConsentAccepted(e.target.checked)}
                    aria-invalid={showPaymentError("consent")}
                    className="mt-0.5 h-4 w-4 flex-none accent-gold-deep"
                  />
                  <span>{c.consent}</span>
                </label>
                {showPaymentError("consent") && <FieldError id="checkout-consent-error">{k.errors.consent}</FieldError>}
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-white p-4 ring-1 ring-ink/7">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Wallet size={16} className="text-gold-deep" aria-hidden />
                {c.codTitle}
              </p>
              <p className="mt-1 text-sm text-neutral-700">{c.codText}</p>
            </div>
          )}

          <div aria-live="polite">
            {triedPayment && missingPayment.length > 0 && (
              <MissingBanner text={k.missing(missingPayment.map((f) => k.missingNames[f]))} />
            )}
            {error && <MissingBanner text={error} />}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => goTo(1)} className="flex-1">
              {c.back}
            </Button>
            <Button type="button" variant="accent" loading={submitting} onClick={handleConfirm} className="flex-1">
              {submitting ? c.sending : c.confirm}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  hint,
  error,
  ok,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error: string | null;
  /** shows a tick once the value is acceptable */
  ok?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="scroll-mt-28">
      <label htmlFor={id} className="mb-1.5 flex items-center justify-between gap-2 text-sm font-semibold text-ink">
        {label}
        {ok && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal text-white" aria-hidden>
            <Check size={12} strokeWidth={3.5} />
          </span>
        )}
      </label>
      {children}
      {error ? (
        <FieldError id={`${id}-error`}>{error}</FieldError>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-neutral-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-600">
      <AlertCircle size={15} aria-hidden className="flex-none" />
      {children}
    </p>
  );
}

function MissingBanner({ text }: { text: string }) {
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 ring-1 ring-red-200">
      <AlertCircle size={17} aria-hidden className="mt-0.5 flex-none" />
      {text}
    </p>
  );
}
