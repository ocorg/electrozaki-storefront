// Meta (Facebook/Instagram) Pixel: tells Meta Ads what visitors from an ad
// do on the site, so campaigns can optimise for people who order. Pixel IDs
// are public (they sit in every page's HTML): Electro Zaki's is set here,
// NEXT_PUBLIC_META_PIXEL_ID can override it.
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1113388254762708";

type MetaEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

type Params = {
  value?: number;
  currency?: "MAD";
  content_ids?: string[];
  content_type?: "product";
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
export function metaTrack(event: MetaEvent, params?: Params, eventId?: string): void {
  try {
    if (!META_PIXEL_ID || typeof window === "undefined") return;
    const data = params ? { currency: "MAD", ...params } : undefined;
    const args: unknown[] = eventId ? ["track", event, data ?? {}, { eventID: eventId }] : data ? ["track", event, data] : ["track", event];
    // Not loaded yet (it loads after the page): keep it for MetaPixel to send.
    if (!window.fbq) (window.__metaPending ??= []).push(args);
    else window.fbq(...args);
  } catch {
    // ignore
  }
}
