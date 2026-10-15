// One place for the shop's identity: name, city, WhatsApp, public URL.
// Before this, the WhatsApp link was typed by hand in 13 files.

export const SHOP = {
  name: "Electro Zaki",
  city: "Meknès",
  country: "MA",
  tagline: "Téléphones & accessoires à Meknès",
  whatsappNumber: "212667654430",
  whatsappDisplay: "+212 6 67 65 44 30",
} as const;

// Accessories aren't sold online yet (photos and texts are being prepared):
// while false, only phones and repair show on the site, and every accessory
// aisle or product page says "bientôt disponible" with a WhatsApp button.
// Set to true to open them everywhere at once.
export const ACCESSORIES_OPEN = false;

/** The phones aisle; while accessories are closed, the only aisle shown. */
export const PHONES_AISLE = "telephones";

/** Is this aisle open online? (`parentSlug` for a sub-aisle.) */
export function aisleOpen(slug: string, parentSlug?: string | null): boolean {
  return ACCESSORIES_OPEN || slug === PHONES_AISLE || parentSlug === PHONES_AISLE;
}

/** Product filter for public lists: phones only while accessories are closed. */
export const OPEN_PRODUCTS: { isPhone?: true } = ACCESSORIES_OPEN ? {} : { isPhone: true };

export const WHATSAPP_URL = `https://wa.me/${SHOP.whatsappNumber}`;

/** WhatsApp link with a pre-written message (e.g. about one product). */
export function whatsappLink(text?: string): string {
  return text ? `${WHATSAPP_URL}?text=${encodeURIComponent(text)}` : WHATSAPP_URL;
}

// Absolute URL of the public site, needed for canonical links, the
// sitemap, Open Graph and structured data. Set NEXT_PUBLIC_SITE_URL in
// production (e.g. https://www.electrozaki.ma); Vercel's own production
// hostname is used when it isn't set.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
