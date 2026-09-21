import { prisma } from "./client";

// ── Public-safe ─────────────────────────────────────────────────────────
// Only ever returns a computed discount amount — never the code's internal
// bookkeeping (redemption count, dates) beyond what's needed to explain a
// rejection.

export type PromoValidationResult =
  | { ok: true; promoCodeId: string; code: string; discountAmount: number }
  | { ok: false; error: string };

export async function validatePromoCode(
  rawCode: string,
  cartTotal: number
): Promise<PromoValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Entrez un code promo." };

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) {
    return { ok: false, error: "Code promo invalide." };
  }

  const now = new Date();
  if (promo.startsAt && now < promo.startsAt) {
    return { ok: false, error: "Ce code n'est pas encore actif." };
  }
  if (promo.expiresAt && now > promo.expiresAt) {
    return { ok: false, error: "Ce code a expiré." };
  }
  if (promo.maxRedemptions !== null && promo.redemptionCount >= promo.maxRedemptions) {
    return { ok: false, error: "Ce code a atteint sa limite d'utilisation." };
  }

  const minOrderAmount = promo.minOrderAmount ? Number(promo.minOrderAmount) : 0;
  if (cartTotal < minOrderAmount) {
    return {
      ok: false,
      error: `Ce code nécessite un panier d'au moins ${minOrderAmount} MAD.`,
    };
  }

  const value = Number(promo.value);
  const discountAmount =
    promo.type === "PERCENTAGE"
      ? Math.round(cartTotal * (value / 100))
      : Math.min(Math.round(value), cartTotal); // never discount past 0

  return { ok: true, promoCodeId: promo.id, code: promo.code, discountAmount };
}

// ── Admin-only ──────────────────────────────────────────────────────────
// Only ever called from app/admin routes, which proxy.ts gates behind the
// admin session cookie.

export async function listPromoCodes() {
  return prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
}

export type PromoCodeInput = {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  active: boolean;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  maxRedemptions?: number | null;
  minOrderAmount?: number | null;
};

export async function createPromoCode(input: PromoCodeInput) {
  return prisma.promoCode.create({
    data: {
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      active: input.active,
      startsAt: input.startsAt ?? undefined,
      expiresAt: input.expiresAt ?? undefined,
      maxRedemptions: input.maxRedemptions ?? undefined,
      minOrderAmount: input.minOrderAmount ?? undefined,
    },
  });
}

export async function updatePromoCode(id: string, input: PromoCodeInput) {
  return prisma.promoCode.update({
    where: { id },
    data: {
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      active: input.active,
      startsAt: input.startsAt ?? null,
      expiresAt: input.expiresAt ?? null,
      maxRedemptions: input.maxRedemptions ?? null,
      minOrderAmount: input.minOrderAmount ?? null,
    },
  });
}

export async function deletePromoCode(id: string) {
  await prisma.promoCode.delete({ where: { id } });
}
