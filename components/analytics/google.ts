// Google Analytics 4 (property "electrozaki.ma", stream "Electro Zaki - site",
// created 2026-10-25). The measurement ID is public: it sits in every page's
// HTML. NEXT_PUBLIC_GA_ID can override it (empty = off). Page views,
// scrolling and outgoing clicks are counted by GA's "enhanced measurement";
// the sales steps are sent from metaTrack() (components/analytics/meta.ts),
// so Meta and Google see the same events.
export const GA_ID: string = (process.env.NEXT_PUBLIC_GA_ID ?? "G-1RGSBJ60GD").trim();

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * gtag(), set up on first use with the property's "js" and "config" lines
 * first (a page can send an event before the layout's tag runs); calls made
 * before gtag.js loads wait in dataLayer.
 */
export function gtag(...args: unknown[]): void {
  if (!GA_ID || typeof window === "undefined") return;
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || [];
    // gtag.js reads `arguments` objects from dataLayer, not plain arrays.
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID);
  }
  window.gtag(...args);
}

/** Sets gtag up (once) without sending anything else. */
export function initGtag(): void {
  if (!GA_ID || typeof window === "undefined" || window.gtag) return;
  gtag("set", {});
}

type SaleParams = { value?: number; content_ids?: string[]; content_name?: string; num_items?: number };

/** Meta's standard events as GA4's recommended e-commerce events. Never throws. */
export function gaSaleEvent(event: string, params: SaleParams | undefined, eventId?: string): void {
  try {
    const items = (params?.content_ids ?? []).map((id) => ({ item_id: id, ...(params?.content_name ? { item_name: params.content_name } : {}) }));
    const base = { currency: "MAD", value: params?.value ?? 0, items };
    if (event === "ViewContent") gtag("event", "view_item", base);
    else if (event === "AddToCart") gtag("event", "add_to_cart", base);
    else if (event === "InitiateCheckout") gtag("event", "begin_checkout", base);
    else if (event === "Purchase") gtag("event", "purchase", { ...base, ...(eventId ? { transaction_id: eventId } : {}) });
  } catch {
    // statistics must never break the page
  }
}
