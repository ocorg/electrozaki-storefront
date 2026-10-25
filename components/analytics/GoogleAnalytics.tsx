"use client";

import { useEffect } from "react";
import Script from "next/script";
import { GA_ID, initGtag } from "./google";

// Google Analytics: configured as soon as the page is interactive (events
// queue up from then on), its script loaded once the page has finished
// loading and the phone is idle, like the Meta Pixel, so it never delays
// what the visitor sees. Page changes inside the site are counted by GA's
// enhanced measurement (browser history), not here, to avoid double counts.
export function GoogleAnalytics() {
  useEffect(() => {
    initGtag();
  }, []);

  if (!GA_ID) return null;
  return <Script id="ga4" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />;
}
