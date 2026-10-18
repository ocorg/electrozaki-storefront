"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_IDS, metaTrack } from "./meta";

// Loads Meta's Pixel once the page has loaded and the phone is idle (it
// weighed ~1 s of processing on a mid-range phone, delaying the page's text),
// and counts one PageView per page shown (the site changes pages without
// full reloads). Events from before it's ready wait in window.__metaPending.
export function MetaPixel() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!META_PIXEL_IDS.length || last.current === pathname) return;
    const first = last.current === null;
    last.current = pathname;
    // The first PageView is sent by the loader below once it's ready.
    if (!first) metaTrack("PageView");
  }, [pathname]);

  if (!META_PIXEL_IDS.length) return null;
  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
${META_PIXEL_IDS.map((id) => `fbq('init', ${JSON.stringify(id)});`).join("")}
fbq('track', 'PageView');
(window.__metaPending||[]).forEach(function(a){fbq.apply(null,a)});window.__metaPending=[];`}
    </Script>
  );
}
