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
  // Display only — the server recomputes every price (and whether the
  // 300 DH advance applies) from the database when the order is submitted.
  price: number;
  image?: string;
  quantity: number;
  isPhone?: boolean;
  isGift?: boolean; // free gift picked for a phone in the cart
  bundleId?: string; // line added as part of a pack
};

type LineKey = { productId: string; variantId?: string; isGift?: boolean; bundleId?: string };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (line: LineKey) => void;
  updateQuantity: (line: LineKey, quantity: number) => void;
  clear: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);
// v2: lines carry isGift/bundleId; v1 carts are dropped rather than
// resubmitted with gifts mistaken for paid lines.
const STORAGE_KEY = "ez_cart_v2";

function sameLine(a: LineKey, b: LineKey) {
  return (
    a.productId === b.productId &&
    (a.variantId ?? null) === (b.variantId ?? null) &&
    Boolean(a.isGift) === Boolean(b.isGift) &&
    (a.bundleId ?? null) === (b.bundleId ?? null)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load any cart left over from a previous visit, once, on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // Deliberately after mount: the server has no localStorage, so reading
      // it during the first render would make server and client HTML differ.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const removeItem: CartContextValue["removeItem"] = (key) => {
    setItems((prev) => prev.filter((line) => !sameLine(line, key)));
  };

  const updateQuantity: CartContextValue["updateQuantity"] = (key, quantity) => {
    setItems((prev) =>
      prev
        .map((line) => (sameLine(line, key) ? { ...line, quantity } : line))
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
