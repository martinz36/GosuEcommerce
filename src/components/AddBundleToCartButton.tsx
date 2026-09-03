"use client";

import React from "react";
import { Zap, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export interface BundleItemInput {
  id: string;
  title: string;
  price: number;
  imageUrl?: string | null;
}

interface AddBundleToCartButtonProps {
  bundleId: string;
  bundleTitle: string;
  bundlePrice: number;
  items: BundleItemInput[];
}

export function AddBundleToCartButton({ bundleTitle, bundlePrice, items }: AddBundleToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddBundle = () => {
    if (items && items.length > 0) {
      items.forEach((item) => {
        addToCart({
          id: item.id,
          productId: item.id,
          title: item.title,
          price: item.price,
          imageUrl: item.imageUrl,
        });
      });
    } else {
      // Si es un bundle genérico en oferta
      addToCart({
        id: `bundle_${Date.now()}`,
        productId: `bundle_${Date.now()}`,
        title: bundleTitle,
        price: bundlePrice,
        imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
      });
    }
  };

  return (
    <button
      onClick={handleAddBundle}
      className="btn-pill bg-accent-pink text-white font-extrabold text-sm hover:bg-white hover:text-black transition-colors flex items-center gap-2 shadow-lg shadow-accent-pink/20"
    >
      <Zap className="w-4 h-4 fill-white hover:fill-black" />
      <span>AGREGAR PACK COMPLETO</span>
    </button>
  );
}
