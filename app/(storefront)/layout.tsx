import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartContext";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { FloatingWhatsApp } from "@/components/storefront/FloatingWhatsApp";
import { getAllCategories } from "@/lib/db/categories";
import { PageTracker } from "@/components/analytics/PageTracker";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const categories = await getAllCategories();

  return (
    <CartProvider>
      <Header categories={categories} />
      <main>{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <PageTracker />
    </CartProvider>
  );
}
