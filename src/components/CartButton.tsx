"use client";

import React, { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export function CartButton() {
  const toggleCart = useCartStore((state) => state.toggleCart);
  const items = useCartStore((state) => state.items);
  
  // Evitar deshidratación en SSR al leer el total de localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalItems = mounted
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <button
      className="relative p-2.5 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors"
      onClick={() => toggleCart(true)}
    >
      <ShoppingBag className="w-5 h-5 text-accent-cyan" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-accent-pink text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center border border-black animate-in fade-in">
          {totalItems}
        </span>
      )}
    </button>
  );
}
