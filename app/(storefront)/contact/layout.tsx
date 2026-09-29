import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself runs in the browser, so its tab title is set here.
export const metadata: Metadata = {
  title: "Contact",
  description: "Écrivez à Electro Zaki, Meknès : WhatsApp ou formulaire. Téléphones, accessoires, réparation.",
  alternates: { canonical: "/contact" },
};

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
