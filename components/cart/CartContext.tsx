"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number; // MAD, snapshot at the moment it was added
  image?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ez_cart_v1";

function sameLine(
  a: { productId: string; variantId?: string },
  b: { productId: string; variantId?: string }
) {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load any cart left over from a previous visit, once, on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupted or blocked storage — starting empty beats crashing the page.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/unavailable — cart still works for the current session.
    }
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((line) => sameLine(line, item));
      if (existing) {
        return prev.map((line) =>
          sameLine(line, item) ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem: CartContextValue["removeItem"] = (productId, variantId) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, { productId, variantId })));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (
    productId,
    quantity,
    variantId
  ) => {
    setItems((prev) =>
      prev
        .map((line) =>
          sameLine(line, { productId, variantId }) ? { ...line, quantity } : line
        )
        .filter((line) => line.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const { totalItems, totalPrice } = useMemo(
    () => ({
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
