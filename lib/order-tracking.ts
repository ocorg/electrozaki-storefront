import { prisma } from "@/lib/db/client";
import { displayName } from "@/lib/reviews";

// ─────────────────────────────────────────────────────────────────────────
// Customer tracking of a website order (/commande/suivi): the reference
// shown after ordering (the order id's first 8 characters) and the phone
// number it was placed with. The steps come from the order (received,
// confirmed, advance) and from the ERP delivery it ships with (prepared,
// on its way, delivered), which the ERP copies onto the order.
// ─────────────────────────────────────────────────────────────────────────

export type OrderStepKey = "received" | "confirmed" | "advance" | "preparing" | "shipped" | "delivered";

export type TrackedOrder = {
  ref: string;
  createdAt: string;
  steps: OrderStepKey[];
  /** index of the step in progress; steps.length when delivered */
  current: number;
  state: "active" | "delivered" | "cancelled" | "returned";
  /** the 300 DH advance, when the order needs one */
  advance: "AWAITING_RECEIPT" | "RECEIPT_UPLOADED" | "VERIFIED" | "REJECTED" | null;
  trackingNumber: string | null;
  deliveryCity: string | null;
  /** promised delivery day (YYYY-MM-DD) */
  deliveryEstimate: string | null;
  items: TrackedItem[];
  total: number;
  /** "Prénom N.", suggested as the name on a review */
  reviewName: string;
};

export type TrackedItem = {
  id: string;
  name: string;
  quantity: number;
  /** once delivered: every line but the free gifts */
  reviewable: boolean;
  review: { rating: number; comment: string | null; authorName: string } | null;
};

const REF_RE = /^[A-Z0-9]{8}$/;

export function cleanOrderRef(ref: string): string {
  return ref.trim().toUpperCase().replace(/^#/, "");
}

export function isOrderRef(ref: string): boolean {
  return REF_RE.test(ref);
}

const lastDigits = (phone: string) => phone.replace(/\D/g, "").slice(-9);

export async function findTrackedOrder(ref: string, phone: string): Promise<TrackedOrder | null> {
  const clean = cleanOrderRef(ref);
  if (!isOrderRef(clean) || lastDigits(phone).length < 9) return null;
  const candidates = await prisma.orderRequest.findMany({
    where: { id: { startsWith: clean.toLowerCase() } },
    select: {
      id: true,
      createdAt: true,
      customerPhone: true,
      customerName: true,
      status: true,
      requiresAdvance: true,
      advancePaymentStatus: true,
      shippingStatus: true,
      trackingNumber: true,
      deliveryCity: true,
      deliveryEstimate: true,
      totalEstimate: true,
      items: {
        select: {
          id: true,
          productNameSnapshot: true,
          quantity: true,
          isGift: true,
          review: { select: { rating: true, comment: true, authorName: true } },
        },
        orderBy: { id: "asc" },
      },
    },
    take: 5,
  });
  const order = candidates.find((o) => lastDigits(o.customerPhone) === lastDigits(phone));
  if (!order) return null;

  const steps: OrderStepKey[] = ["received", "confirmed", ...(order.requiresAdvance ? (["advance"] as const) : []), "preparing", "shipped", "delivered"];
  const at = (key: OrderStepKey) => steps.indexOf(key);
  const advanceDone = !order.requiresAdvance || order.advancePaymentStatus === "VERIFIED";

  let state: TrackedOrder["state"] = "active";
  let current: number;
  const ship = order.shippingStatus;
  if (order.status === "CANCELLED" || ship === "CANCELLED") {
    state = "cancelled";
    current = 0;
  } else if (ship === "RETURNED") {
    state = "returned";
    current = at("shipped");
  } else if (ship === "DELIVERED") {
    state = "delivered";
    current = steps.length;
  } else if (ship === "IN_TRANSIT") {
    current = at("shipped");
  } else if (ship === "PREPARING") {
    current = at("preparing");
  } else if (order.status === "NEW") {
    current = at("received");
  } else if (order.status === "CONTACTED") {
    current = at("confirmed");
  } else {
    // CONFIRMED: waiting for the advance, or being prepared.
    current = advanceDone ? at("preparing") : at("advance");
  }

  return {
    ref: clean,
    createdAt: order.createdAt.toISOString(),
    steps,
    current,
    state,
    advance: order.requiresAdvance && order.advancePaymentStatus !== "NOT_REQUIRED" ? order.advancePaymentStatus : null,
    trackingNumber: order.trackingNumber,
    deliveryCity: order.deliveryCity,
    deliveryEstimate: order.deliveryEstimate ? order.deliveryEstimate.toISOString().slice(0, 10) : null,
    items: order.items.map((i) => ({
      id: i.id,
      name: i.productNameSnapshot,
      quantity: i.quantity,
      reviewable: state === "delivered" && !i.isGift,
      review: i.review,
    })),
    total: Number(order.totalEstimate),
    reviewName: displayName(order.customerName),
  };
}
