import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartContext";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { getAllCategories } from "@/lib/db/categories";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const categories = await getAllCategories();

  return (
    <CartProvider>
      <Header categories={categories} />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  );
}
