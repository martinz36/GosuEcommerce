import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncCartSessionAction } from "@/app/(shop)/actions";

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
}

export interface AppliedDiscount {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  discountAmount: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discount: AppliedDiscount | null;
  loyaltyPointsUsed: number;

  addToCart: (product: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  applyDiscount: (discount: AppliedDiscount) => void;
  removeDiscount: () => void;
  applyLoyaltyPoints: (points: number) => void;
  removeLoyaltyPoints: () => void;

  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getLoyaltyDiscountAmount: (exchangeRate: number, isPEN: boolean) => number;
  getTotalItems: () => number;
}

const triggerSilentSync = (items: CartItem[], subtotal: number) => {
  if (typeof window !== "undefined") {
    let sessionId = localStorage.getItem("gosu_session_id");
    if (!sessionId) {
      sessionId = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      localStorage.setItem("gosu_session_id", sessionId);
    }
    syncCartSessionAction(sessionId, items, subtotal).catch((err) => {
      console.error("Error silencioso al sincronizar CartSession:", err);
    });
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discount: null,
      loyaltyPointsUsed: 0,

      addToCart: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...currentItems, { ...product, quantity: 1 }];
        }

        set({ items: newItems, isOpen: true });

        const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        triggerSilentSync(newItems, subtotal);
      },

      removeFromCart: (id) => {
        const newItems = get().items.filter((item) => item.id !== id);
        set({ items: newItems });

        const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        triggerSilentSync(newItems, subtotal);
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }

        const newItems = get().items.map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        set({ items: newItems });

        const subtotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        triggerSilentSync(newItems, subtotal);
      },

      clearCart: () => {
        set({ items: [], discount: null, loyaltyPointsUsed: 0, isOpen: false });
        triggerSilentSync([], 0);
      },

      toggleCart: (open) => {
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen }));
      },

      applyDiscount: (discount) => {
        set({ discount });
      },

      removeDiscount: () => {
        set({ discount: null });
      },

      applyLoyaltyPoints: (points) => {
        set({ loyaltyPointsUsed: points });
      },

      removeLoyaltyPoints: () => {
        set({ loyaltyPointsUsed: 0 });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        if (!discount) return 0;
        return discount.discountAmount;
      },

      // NUEVA REGLA ESTRICTA DE CASHBACK DE NEGOCIO: 40 PUNTOS = S/. 1.00 PEN DE DESCUENTO (2.5%)
      getLoyaltyDiscountAmount: (exchangeRate: number, isPEN: boolean) => {
        const points = get().loyaltyPointsUsed;
        if (!points || points <= 0) return 0;
        const discountInPEN = points / 40; // 40 pts = S/. 1.00 PEN
        if (isPEN) {
          return discountInPEN;
        } else {
          return exchangeRate > 0 ? discountInPEN / exchangeRate : discountInPEN;
        }
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "gosu-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
