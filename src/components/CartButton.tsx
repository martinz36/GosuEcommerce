"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

export function CartButton() {
  return (
    <button
      className="relative p-2.5 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors"
      onClick={() => console.log("Abrir carrito de compras")}
    >
      <ShoppingBag className="w-5 h-5 text-accent-cyan" />
      <span className="absolute -top-1 -right-1 bg-accent-pink text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
        0
      </span>
    </button>
  );
}
