"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Image as ImageIcon, Flame } from "lucide-react";
import { AddToCartButton } from "./AddToCartButton";
import { useStoreSettings } from "@/providers/StoreProvider";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description?: string | null;
    priceUSD?: number | null;
    pricePEN?: number | null;
    basePrice?: number | null;
    stock?: number | null;
    imageUrl?: string | null;
    isFamily?: boolean | null;
    familyId?: string | null;
    categoryName?: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { currency, currencySymbol } = useStoreSettings();

  const isPEN = currency === "PEN";
  const rawPriceUSD = Number(product.priceUSD || product.basePrice || 0);
  const rawPricePEN = Number(product.pricePEN || (rawPriceUSD ? rawPriceUSD * 3.75 : 0));

  const displayPrice = isPEN ? rawPricePEN : rawPriceUSD;
  const safePrice = isNaN(displayPrice) ? 0 : displayPrice;
  const stock = typeof product.stock === "number" ? product.stock : 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="card-base flex flex-col justify-between h-full group font-body border border-surface-muted hover:border-neutral-700 bg-surface rounded-2xl overflow-hidden shadow-lg transition-all"
    >
      <div>
        {/* Contenedor de Imagen con Efecto Hover & Badges Dinámicos */}
        <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <motion.img
              src={product.imageUrl}
              alt={product.title || "Producto GOSU"}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-600 space-y-1">
              <ImageIcon className="w-10 h-10" />
              <span className="text-[10px] font-mono">SIN IMAGEN</span>
            </div>
          )}

          {/* Badges Flotantes de Escasez & Variante */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.isFamily && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/90 text-purple-200 border border-purple-500/40 backdrop-blur-md flex items-center gap-1">
                <Layers className="w-3 h-3" /> Variante
              </span>
            )}

            {stock <= 3 && stock > 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-black shadow-lg flex items-center gap-1 animate-pulse">
                <Flame className="w-3 h-3 text-black" /> ¡Últimas {stock} un.!
              </span>
            )}

            {stock <= 0 && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-lg">
                Agotado
              </span>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="p-5 space-y-2">
          {product.categoryName && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-accent-cyan block">
              {product.categoryName}
            </span>
          )}

          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-extrabold text-sm text-white group-hover:text-accent-cyan transition-colors line-clamp-2 leading-snug">
              {product.title || "Producto GOSU® TCG"}
            </h3>
          </Link>
        </div>
      </div>

      {/* Pie con Precio Explícito y Botón de Carrito */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-surface-muted/50 mt-2">
        <div>
          <span className="text-[10px] font-mono text-neutral-400 block uppercase">
            Precio ({currency})
          </span>
          <span className="text-lg font-black font-mono text-white">
            {currencySymbol}{safePrice.toFixed(2)}
          </span>
        </div>

        {/* Botón Rápido 'Agregar al Carrito' */}
        <AddToCartButton
          productId={product.id}
          productTitle={product.title || "Producto GOSU® TCG"}
          price={safePrice}
          imageUrl={product.imageUrl}
        />
      </div>
    </motion.div>
  );
}
