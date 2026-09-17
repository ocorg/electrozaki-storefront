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
    "Téléphones neufs et reconditionnés, accessoires, et réparation à Meknès. Commandez directement sur WhatsApp.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className={manrope.className}>{children}</body>
    </html>
  );
}
