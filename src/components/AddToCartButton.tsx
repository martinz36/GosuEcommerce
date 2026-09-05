"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/providers/StoreProvider";

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  price: string | number; // Se acepta precio numérico en USD o formateado
  imageUrl?: string | null;
  className?: string;
  children?: React.ReactNode;
}

export function AddToCartButton({
  productId,
  productTitle,
  price,
  imageUrl,
  className,
  children,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { exchangeRate } = useStoreSettings();

  // Si el precio viene como número, se asume USD base. Si viene como string formateado, extraer número.
  let numericPriceUSD = 0;
  if (typeof price === "number") {
    numericPriceUSD = price;
  } else {
    const rawNum = parseFloat(price.replace(/[^0-9.]/g, ""));
    // Si la cadena formateada incluye S/., revertir la tasa de cambio para guardar USD base en el store
    if (price.includes("S/.") && exchangeRate > 0) {
      numericPriceUSD = rawNum / exchangeRate;
    } else {
      numericPriceUSD = rawNum;
    }
  }

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart({
      id: productId,
      productId: productId,
      title: productTitle,
      price: isNaN(numericPriceUSD) ? 0 : numericPriceUSD,
      imageUrl: imageUrl,
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      className={
        className ||
        "w-full btn-pill bg-white text-black font-extrabold text-base py-4 hover:bg-accent-cyan transition-colors flex items-center justify-center gap-3 shadow-lg shadow-white/10"
      }
    >
      {children || (
        <>
          <ShoppingBag className="w-5 h-5" />
          <span>AGREGAR AL CARRITO</span>
        </>
      )}
    </button>
  );
}
