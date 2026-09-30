import type { ReactNode } from "react";
import { CartProvider } from "@/components/cart/CartContext";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { FloatingWhatsApp } from "@/components/storefront/FloatingWhatsApp";
import { MobileTabBar } from "@/components/storefront/MobileTabBar";
import { getAllCategories } from "@/lib/db/categories";
import { getAisles } from "@/lib/db/storefront";
import { PageTracker } from "@/components/analytics/PageTracker";
import { JsonLd, storeJsonLd } from "@/lib/json-ld";

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const [categories, aisles] = await Promise.all([getAllCategories(), getAisles()]);

  return (
    <CartProvider>
      <a
        href="#contenu"
        className="sr-only z-100 rounded-full bg-ink px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Aller au contenu
      </a>
      <JsonLd data={storeJsonLd()} />
      <Header categories={categories} aisles={aisles} />
      <main id="contenu" tabIndex={-1} className="pb-16 outline-none md:pb-0">
        {children}
      </main>
      <Footer aisles={aisles} />
      <FloatingWhatsApp />
      <MobileTabBar />
      <PageTracker />
    </CartProvider>
  );
}
