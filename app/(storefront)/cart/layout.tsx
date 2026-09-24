import type { Metadata } from "next";
import type { ReactNode } from "react";

// The page itself runs in the browser, so its tab title is set here.
export const metadata: Metadata = { title: "Panier" };

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
