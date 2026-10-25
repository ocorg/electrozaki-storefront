import { gaSaleEvent } from "./google";

// Meta (Facebook/Instagram) Pixel: tells Meta Ads what visitors from an ad
// do on the site, so campaigns can optimise for people who order. Pixel IDs
// are public (they sit in every page's HTML). Every event goes to each pixel:
// - 1113388254762708 "Electro Zaki site" (portfolio "Electro Zaki Ancien"),
//   the one the ad account and its catalogue use;
// - 2132858377359488 (portfolio "Electro Zaki"), the pixel of the catalogue
//   "Electro Zaki - electrozaki.ma" there (Meta won't share pixels between
//   the two portfolios yet).
// NEXT_PUBLIC_META_PIXEL_ID (comma-separated) can override them.
export const META_PIXEL_IDS: string[] = (process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1113388254762708,2132858377359488")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

type MetaEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

type Params = {
  value?: number;
  currency?: "MAD";
  content_ids?: string[];
  // "product" = an item's own id in the catalogue feed; "product_group" = a
  // used phone's listing, whose units are separate items (lib/catalog-feed.ts).
  content_type?: "product" | "product_group";
  content_name?: string;
  num_items?: number;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    /** events sent before the Pixel finished loading (flushed by MetaPixel) */
    __metaPending?: unknown[][];
  }
}

/**
 * Sends a standard event. `eventId` (e.g. the order reference) lets Meta
 * de-duplicate it if the same event is later also sent from the server.
 * Never throws: statistics must not break the page.
 */
/**
 * The catalogue id of a cart line, as lib/catalog-feed.ts writes it: a used
 * phone's unit has its own row; everything else is the product.
 */
export function catalogId(item: { productId: string; variantId?: string; isPhone?: boolean }): string {
  return item.isPhone && item.variantId ? item.variantId : item.productId;
}

export function metaTrack(event: MetaEvent, params?: Params, eventId?: string): void {
  // The same sales steps for Google Analytics (add to cart, checkout, order).
  gaSaleEvent(event, params, eventId);
  try {
    if (!META_PIXEL_IDS.length || typeof window === "undefined") return;
    const data = params ? { currency: "MAD", ...params } : undefined;
    const args: unknown[] = eventId ? ["track", event, data ?? {}, { eventID: eventId }] : data ? ["track", event, data] : ["track", event];
    // Not loaded yet (it loads after the page): keep it for MetaPixel to send.
    if (!window.fbq) (window.__metaPending ??= []).push(args);
    else window.fbq(...args);
  } catch {
    // ignore
  }
}
