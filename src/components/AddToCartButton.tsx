"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  price: string;
}

export function AddToCartButton({ productId, productTitle, price }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    console.log(`[CARRITO] Producto agregado: ID=${productId}, Título="${productTitle}", Precio=${price}`);
    alert(`¡"${productTitle}" fue agregado al carrito exitosamente! (Revisa la consola F12)`);
  };

  return (
    <button
      onClick={handleAddToCart}
      className="w-full btn-pill bg-white text-black font-extrabold text-base py-4 hover:bg-accent-cyan transition-colors flex items-center justify-center gap-3 shadow-lg shadow-white/10"
    >
      <ShoppingBag className="w-5 h-5" />
      <span>AGREGAR AL CARRITO</span>
    </button>
  );
}
