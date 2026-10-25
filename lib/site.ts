// One place for the shop's identity: name, city, WhatsApp, public URL.
// Before this, the WhatsApp link was typed by hand in 13 files.

export const SHOP = {
  name: "Electro Zaki",
  city: "Meknès",
  country: "MA",
  tagline: "Téléphones & accessoires à Meknès",
  whatsappNumber: "212620210124",
  whatsappDisplay: "+212 6 20 21 01 24",
  // The shop on Google Maps (contact page map, "Itinéraire", structured data).
  mapsUrl: "https://maps.app.goo.gl/BW9tPvGbrGzyyU1U6",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.484705896304!2d-5.487759188401055!3d33.9135508730978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda045608ea6b145%3A0x151c1b970e2bb055!2sELECTRO%20ZAKI!5e1!3m2!1sen!2sma!4v1792209188162!5m2!1sen!2sma",
  geo: { latitude: 33.9135509, longitude: -5.4851789 },
} as const;

/**
 * The seller's legal identity, shown on the terms of sale (law 31-08, art.
 * 29). Numbers left null aren't shown: fill them in from the shop's papers
 * (registre de commerce, ICE, identifiant fiscal), never with examples.
 */
export const LEGAL = {
  legalName: "EZ ELECTRO ZAKI",
  tradeName: "Electro Zaki",
  address: "Boulevard Al Massira Al Khadra, Ouislane, Meknès (en face de la station de taxis Hamirya)",
  rc: "102816 (Meknès)" as string | null,
  ice: "002533374000004" as string | null,
  fiscalId: "45725467" as string | null,
  tp: "17202369" as string | null,
  email: null as string | null,
};

/** The terms of sale page; its returns section is at #retours. */
export const TERMS_PATH = "/conditions-de-vente";
export const RETURN_DAYS = 7;

/** The shop's social pages (footer, contact page, structured data). */
export const SOCIAL = {
  facebook: "https://www.facebook.com/profile.php?id=61553990252782",
  instagram: "https://www.instagram.com/electro_zaki_ez/",
  tiktok: "https://www.tiktok.com/@electro_zaki",
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
