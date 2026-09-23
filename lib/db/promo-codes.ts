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
