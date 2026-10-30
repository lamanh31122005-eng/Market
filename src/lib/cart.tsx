import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = { productId: string; slug: string; name: string; price: number; unit: string; quantity: number };

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "thitsach-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add: CartCtx["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.productId === item.productId);
      if (ex) return prev.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i));
      return [...prev, { ...item, quantity: qty }];
    });
    toast.success(`Đã thêm ${item.name} vào giỏ`);
  };
  const setQty = (productId: string, qty: number) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i))));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + i.quantity * i.price, 0);

  return <Ctx.Provider value={{ items, add, setQty, clear, count, total }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}
