import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Electro Zaki — Téléphones et accessoires à Meknès",
  description:
    "Téléphones neufs et reconditionnés, accessoires, et réparation à Meknès. Commandez directement sur WhatsApp.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
