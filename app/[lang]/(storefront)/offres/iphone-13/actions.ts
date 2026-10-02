"use server";

import { z } from "zod";
import { allowRequest, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { MOROCCAN_PHONE_RE } from "@/lib/validation";
import { priceCart, type CartLineInput, type PricedLine } from "@/lib/db/cart-pricing";
import { createOrderRequest } from "@/lib/db/order-requests";
import { landingPrice, landingStatus } from "@/lib/db/landing";
import { findCity, estimateDelivery } from "@/lib/delivery";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import { ADDONS, INCLUDED, getOfferPage, offerAccessories, resolveOfferUnit } from "@/lib/offers/iphone13";

// Order from the iPhone 13 offer page. Everything is priced here, from the
// database: the phone gets the ERP promo page's price, the add-ons their
// normal price (through priceCart, like the cart), the included case and
// glass are free. The browser only says which unit and which add-ons.
//
// Messages stay French (the page translates them with translateError);
// each one must match lib/i18n/dictionaries/fr.ts "errors" word for word.

const OFFER_ENDED = "Cette offre n'est plus disponible.";
const UNIT_GONE = "Ce téléphone vient d'être réservé. Merci d'en choisir un autre.";
const ADVANCE = 300;

const contactSchema = z.object({
  customerName: z.string().trim().min(2, "Merci d'indiquer votre nom complet.").max(120),
  customerPhone: z.string().trim().regex(MOROCCAN_PHONE_RE, "Numéro de téléphone invalide (ex: 06XXXXXXXX)."),
});

type Input = {
  unitId: string;
  addons: string[];
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
};

type Result = { ok: true; reference: string; whatsappUrl: string } | { ok: false; error: string };

export async function submitIphone13Order(input: Input): Promise<Result> {
  if (!(await allowRequest("order"))) return { ok: false, error: RATE_LIMIT_MESSAGE };

  const contact = contactSchema.safeParse({ customerName: input.customerName, customerPhone: input.customerPhone });
  if (!contact.success) return { ok: false, error: contact.error.issues[0]?.message ?? "Champs invalides." };

  const city = findCity(String(input.deliveryCity ?? ""));
  if (!city) return { ok: false, error: "Merci de choisir votre ville de livraison dans la liste." };

  const page = await getOfferPage();
  if (!page || landingStatus(page) !== "live") return { ok: false, error: OFFER_ENDED };

  const unit = await resolveOfferUnit(String(input.unitId ?? ""));
  if (!unit) return { ok: false, error: UNIT_GONE };

  // Only add-ons this page offers, each once.
  const wanted = new Set(Array.isArray(input.addons) ? input.addons.map(String) : []);
  const [addons, included] = await Promise.all([offerAccessories(ADDONS), offerAccessories(INCLUDED)]);
  const chosen = addons.filter((a) => wanted.has(a.key));

  const lines: CartLineInput[] = [
    { productId: unit.productId, variantId: unit.id, quantity: 1 },
    ...chosen.map((a) => ({ productId: a.productId, quantity: 1 })),
  ];
  const cart = await priceCart(lines);
  if (!cart.ok) return { ok: false, error: cart.error };

  const priced: PricedLine[] = cart.lines.map((l) =>
    l.variantId === unit.id
      ? { ...l, productName: `${l.productName} (offre iPhone 13)`, unitPrice: landingPrice(page, l.unitPrice) }
      : l
  );
  // Free with the phone; skipped (not refused) if one just ran out.
  for (const item of included) {
    priced.push({ productId: item.productId, productName: `${item.name} (offert, offre iPhone 13)`, unitPrice: 0, quantity: 1, isGift: true });
  }

  const estimate = estimateDelivery(city);
  const delivery = {
    city: city.name,
    fee: city.fee,
    estimate: estimate.deliverable ? estimate.deliveryDate : null,
    unavailable: !estimate.deliverable,
  };

  const order = await createOrderRequest({
    customerName: contact.data.customerName,
    customerPhone: contact.data.customerPhone,
    notes: `Offre iPhone 13 (/offres/iphone-13). Adresse exacte à prendre lors de l'appel de confirmation. Avance de ${ADVANCE} DH à régler avant expédition.`,
    // A phone: the advance applies. No receipt yet: it's arranged on the call.
    requiresAdvance: true,
    // The form says the customer will be called to confirm; nothing else is stored.
    dataConsentAccepted: true,
    lines: priced,
    delivery,
    landingPageId: page.id,
  });

  const reference = order.id.slice(0, 8).toUpperCase();
  const whatsappUrl = buildWhatsAppOrderLink(
    contact.data.customerName,
    priced.map((l) => ({ productName: l.productName, variantName: l.variantName, quantity: l.quantity, price: l.unitPrice })),
    { reference, requiresAdvance: true, receiptUploaded: false, delivery }
  );
  return { ok: true, reference, whatsappUrl };
}
