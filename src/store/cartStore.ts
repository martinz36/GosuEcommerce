import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncCartSessionAction } from "@/app/(shop)/actions";

export interface CartItem {
  id: string; // SKU o ID de combinación
  productId: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  variantName?: string;
}

export interface AppliedDiscount {
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  value: number;
  discountAmount: number;
}

interface CartState {
  sessionId: string;
  items: CartItem[];
  isOpen: boolean;
  discount: AppliedDiscount | null;
  userEmail: string | null;

  // Acciones
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  setUserEmail: (email: string) => void;
  applyDiscount: (discount: AppliedDiscount) => void;
  removeDiscount: () => void;

  // Selectores de cálculo
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
}

const getOrCreateSessionId = () => {
  if (typeof window === "undefined") return "server_session";
  let id = localStorage.getItem("gosu_session_id");
  if (!id) {
    id = `gosu_session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("gosu_session_id", id);
  }
  return id;
};

// Función auxiliar para sincronizar silenciosamente con Neon DB
const triggerCartSync = (sessionId: string, items: CartItem[], userEmail?: string | null) => {
  if (typeof window === "undefined") return;
  const subtotal = items.reduce((sub, item) => sub + item.price * item.quantity, 0);
  
  // Ejecutar Server Action en segundo plano (fire and forget)
  syncCartSessionAction(sessionId, items, subtotal, userEmail).catch((err) => {
    console.error("Error en sincronización silenciosa del carrito:", err);
  });
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      sessionId: getOrCreateSessionId(),
      items: [],
      isOpen: false,
      discount: null,
      userEmail: null,

      addToCart: (itemData, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === itemData.id);
          let newItems = [...state.items];

          if (existingIndex > -1) {
            newItems[existingIndex].quantity += quantity;
          } else {
            newItems.push({ ...itemData, quantity });
          }

          // Sincronización silenciosa con Neon DB
          triggerCartSync(state.sessionId, newItems, state.userEmail);

          return {
            items: newItems,
            isOpen: true,
          };
        });
      },

      removeFromCart: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          triggerCartSync(state.sessionId, newItems, state.userEmail);
          return { items: newItems };
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          let newItems: CartItem[];
          if (quantity <= 0) {
            newItems = state.items.filter((item) => item.id !== id);
          } else {
            newItems = state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            );
          }

          triggerCartSync(state.sessionId, newItems, state.userEmail);
          return { items: newItems };
        });
      },

      clearCart: () => {
        const sessionId = get().sessionId;
        triggerCartSync(sessionId, [], null);
        set({ items: [], discount: null });
      },

      toggleCart: (open) => {
        set((state) => ({
          isOpen: open !== undefined ? open : !state.isOpen,
        }));
      },

      setUserEmail: (email) => {
        set((state) => {
          triggerCartSync(state.sessionId, state.items, email);
          return { userEmail: email };
        });
      },

      applyDiscount: (discount) => {
        set({ discount });
      },

      removeDiscount: () => {
        set({ discount: null });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sub, item) => sub + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const discount = get().discount;
        if (!discount || subtotal <= 0) return 0;

        if (discount.type === "PERCENTAGE") {
          return (subtotal * discount.value) / 100;
        } else if (discount.type === "FIXED_AMOUNT") {
          return Math.min(subtotal, discount.value);
        }
        return 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discountAmount = get().getDiscountAmount();
        return Math.max(0, subtotal - discountAmount);
      },
    }),
    {
      name: "gosu-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        items: state.items,
        discount: state.discount,
        userEmail: state.userEmail,
      }),
    }
  )
);
