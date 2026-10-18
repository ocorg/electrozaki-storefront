import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-visitor pages: the cart, search results, order and
      // repair tracking, the API. Every page lives under its language
      // (/fr/cart, /ar/search…), hence the "/*/" (a bare "/cart" matched
      // nothing).
      disallow: ["/api/", "/*/cart", "/*/search", "/*/commande/suivi", "/*/reparation/suivi"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
