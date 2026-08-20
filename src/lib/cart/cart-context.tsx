"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, cartItemKey } from "./types";

const STORAGE_KEY = "rp10fut_cart";

type CartContextValue = {
  items: CartItem[];
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (item: CartItem) => void;
  updateQty: (index: number, qty: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Reading localStorage during the initial render (instead of here) would
    // desync from the server-rendered markup and trigger a hydration
    // mismatch -- this has to run post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(readStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addToCart: (item) => {
        setItems((prev) => {
          const key = cartItemKey(item);
          const idx = prev.findIndex((i) => cartItemKey(i) === key);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
            return next;
          }
          return [...prev, item];
        });
      },
      updateQty: (index, qty) => {
        setItems((prev) => prev.map((i, idx) => (idx === index ? { ...i, qty: Math.max(1, qty) } : i)));
      },
      removeItem: (index) => {
        setItems((prev) => prev.filter((_, idx) => idx !== index));
      },
      clearCart: () => setItems([]),
    }),
    [items, drawerOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
