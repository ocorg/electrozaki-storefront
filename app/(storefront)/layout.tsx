import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartContext";
import { Header } from "@/components/storefront/Header";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
    </CartProvider>
  );
}
