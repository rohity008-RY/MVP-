import { create } from "zustand";

interface CartLine {
  sellerProductId: string;
  productId: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

interface CartState {
  items: CartLine[];
  add: (line: Omit<CartLine, "qty">) => void;
  updateQty: (sellerProductId: string, delta: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (line) =>
    set((state) => {
      const existing = state.items.find((item) => item.sellerProductId === line.sellerProductId);
      if (existing) {
        return { items: state.items.map((item) => (item.sellerProductId === line.sellerProductId ? { ...item, qty: item.qty + 1 } : item)) };
      }
      return { items: [...state.items, { ...line, qty: 1 }] };
    }),
  updateQty: (sellerProductId, delta) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.sellerProductId === sellerProductId ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    })),
  clear: () => set({ items: [] })
}));
