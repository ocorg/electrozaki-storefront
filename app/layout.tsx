import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Bricolage_Grotesque, JetBrains_Mono, Manrope } from "next/font/google";
import { SHOP, SITE_URL } from "@/lib/site";
import "./globals.css";

// Manrope: the brand's body font from the Shopify theme (kept).
// Bricolage Grotesque: display — a grotesque with ink-trap character that
// reads "made here", not "template". JetBrains Mono: prices, battery %,
// storage — the device-readout voice. All three are self-hosted by
// next/font (no request to Google at runtime) and exposed as CSS variables
// that app/globals.css maps to font-sans / font-display / font-mono.
const manrope = Manrope({ subsets: ["latin"], display: "swap", variable: "--font-manrope" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["500", "700", "800"],
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "600", "700"],
});

const DESCRIPTION =
  "Téléphones neufs et d'occasion (iPhone, Samsung, Xiaomi), coques, chargeurs, câbles, écouteurs et réparation à Meknès. État et batterie affichés pour chaque téléphone, livraison partout au Maroc.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Every page's tab reads "Page | Electro Zaki" (pages give only their own name).
  title: {
    default: "Electro Zaki — Téléphones & accessoires à Meknès",
    template: "%s | Electro Zaki",
  },
  description: DESCRIPTION,
  applicationName: SHOP.name,
  openGraph: {
    type: "website",
    locale: "fr_MA",
    siteName: SHOP.name,
    title: "Electro Zaki — Téléphones & accessoires à Meknès",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#111013",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${manrope.variable} ${bricolage.variable} ${jetbrains.variable}`}>
      <body className="bg-paper font-sans text-neutral-900">{children}</body>
    </html>
  );
}
