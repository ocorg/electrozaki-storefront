import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";

// Matches the brand's existing font from the Shopify theme. Using
// `.className` (not `.variable`) applies it directly with no Tailwind
// config changes needed — safer given how much version drift we've
// already hit in this project.
const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Electro Zaki — Téléphones et accessoires à Meknès",
  description:
    "Téléphones neufs et bon occasion, accessoires, et réparation à Meknès. Commandez directement sur WhatsApp.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      {/* This site has no dark-mode design of its own — every surface is
          explicitly light (bg-white, bg-neutral-50, etc). Without pinning
          text/background here, the scaffold's default dark-mode media
          query silently swaps body text to a light color on devices with
          dark mode on, making any unstyled text (like a bare logo word)
          invisible against our hardcoded light surfaces. */}
      <body className={`${manrope.className} bg-white text-neutral-900`}>{children}</body>
    </html>
  );
}
