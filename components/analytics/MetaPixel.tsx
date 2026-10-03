"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { META_PIXEL_ID, metaTrack } from "./meta";

// Loads Meta's Pixel after the page is interactive and counts one PageView
// per page shown (the site changes pages without full reloads).
export function MetaPixel() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!META_PIXEL_ID || last.current === pathname) return;
    const first = last.current === null;
    last.current = pathname;
    // The first PageView is sent by the loader below once it's ready.
    if (!first) metaTrack("PageView");
  }, [pathname]);

  if (!META_PIXEL_ID) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(META_PIXEL_ID)});
fbq('track', 'PageView');
(window.__metaPending||[]).forEach(function(a){fbq.apply(null,a)});window.__metaPending=[];`}
    </Script>
  );
}
