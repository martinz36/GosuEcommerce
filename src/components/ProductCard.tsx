"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Image as ImageIcon } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/providers/StoreProvider";

export interface ProductCardProps {
  id: string;
  title: string;
  price: number; // Precio listo en la moneda activa (S/. o USD)
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  categoryName?: string;
  isFeatured?: boolean;
}

export function ProductCard({
  id,
  title,
  price,
  compareAtPrice,
  imageUrl,
  categoryName = "Accesorios TCG",
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const { currencySymbol } = useStoreSettings();

  const formattedPrice = `${currencySymbol}${price.toFixed(2)}`;
  const formattedCompareAt = compareAtPrice ? `${currencySymbol}${compareAtPrice.toFixed(2)}` : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: id,
      productId: id,
      title: title,
      price: price,
      imageUrl: imageUrl || undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative bg-surface rounded-2xl border border-neutral-800 hover:border-neutral-700 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-lg font-body"
    >
      <Link href={`/products/${id}`} className="block">
        {/* Contenedor de Imagen con Efecto Hover Zoom */}
        <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-600">
              <ImageIcon className="w-10 h-10 stroke-[1.5]" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Sin Imagen</span>
            </div>
          )}

          {/* Categoría Badge */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-[10px] font-mono font-bold rounded-full bg-black/80 backdrop-blur-md border border-neutral-700 text-accent-cyan tracking-wider uppercase">
              {categoryName}
            </span>
          </div>

          {/* Botón Flotante Rápido de 'Agregar al Carrito' */}
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 p-3 rounded-full bg-white text-black font-bold shadow-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-accent-cyan hover:scale-110"
            title="Agregar rápido al carrito"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>

        {/* Ficha Corta del Producto */}
        <div className="p-5 space-y-2">
          <h3 className="font-bold text-sm text-white group-hover:text-accent-cyan transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>

          <div className="flex items-baseline gap-2 pt-1 font-mono">
            <span className="text-base font-extrabold text-white">{formattedPrice}</span>
            {formattedCompareAt && (
              <span className="text-xs text-neutral-500 line-through">{formattedCompareAt}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
