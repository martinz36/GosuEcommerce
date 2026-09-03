import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  items: CartItem[];
  isOpen: boolean;
  discount: AppliedDiscount | null;

  // Acciones
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  applyDiscount: (discount: AppliedDiscount) => void;
  removeDiscount: () => void;

  // Selectores de cálculo
  getTotalItems: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discount: null,

      addToCart: (itemData, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.id === itemData.id);
          let newItems = [...state.items];

          if (existingIndex > -1) {
            newItems[existingIndex].quantity += quantity;
          } else {
            newItems.push({ ...itemData, quantity });
          }

          return {
            items: newItems,
            isOpen: true, // Abrir automáticamente el drawer al agregar
          };
        });
      },

      removeFromCart: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((item) => item.id !== id),
            };
          }

          return {
            items: state.items.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [], discount: null });
      },

      toggleCart: (open) => {
        set((state) => ({
          isOpen: open !== undefined ? open : !state.isOpen,
        }));
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
        items: state.items,
        discount: state.discount,
      }),
    }
  )
);
