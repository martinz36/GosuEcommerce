"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  price: string | number;
  imageUrl?: string | null;
}

export function AddToCartButton({ productId, productTitle, price, imageUrl }: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const numericPrice = typeof price === "number" ? price : parseFloat(price.replace(/[^0-9.]/g, ""));

  const handleAddToCart = () => {
    addToCart({
      id: productId,
      productId: productId,
      title: productTitle,
      price: isNaN(numericPrice) ? 0 : numericPrice,
      imageUrl: imageUrl,
    });
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
