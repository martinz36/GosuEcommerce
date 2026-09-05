"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Layers, Image as ImageIcon, Flame, ShoppingBag } from "lucide-react";
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
    secondaryImageUrl?: string | null;
    images?: { url: string }[] | null;
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

  const mainImg = product.imageUrl || product.images?.[0]?.url || null;
  const secondaryImg = product.secondaryImageUrl || product.images?.[1]?.url || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-surface border border-neutral-800 hover:border-neutral-700 rounded-2xl p-4 sm:p-5 flex flex-col justify-between h-full shadow-lg transition-all duration-300 font-body"
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Contenedor de Imagen con Efecto Hover Swap & Badges Minimalistas */}
          <div className="relative aspect-square w-full rounded-xl bg-neutral-950 overflow-hidden flex items-center justify-center mb-4">
            {/* Badge 'Variante' o Escasez Flotante en top-2 left-2 z-10 */}
            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
              {product.isFamily && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-neutral-700 flex items-center gap-1 shadow-md">
                  <Layers className="w-3 h-3 text-accent-pink" /> Variante
                </span>
              )}

              {stock <= 3 && stock > 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-black shadow-md flex items-center gap-1 animate-pulse">
                  <Flame className="w-3 h-3 text-black" /> ¡Últimas {stock}!
                </span>
              )}

              {stock <= 0 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-600 text-white shadow-md">
                  Agotado
                </span>
              )}
            </div>

            {/* Imagen Principal y Secundaria en Hover */}
            {mainImg ? (
              <>
                <img
                  src={mainImg}
                  alt={product.title || "Producto GOSU"}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    secondaryImg ? "group-hover:opacity-0" : "group-hover:scale-105"
                  }`}
                />
                {secondaryImg && (
                  <img
                    src={secondaryImg}
                    alt={`${product.title} vista 2`}
                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-600 space-y-1">
                <ImageIcon className="w-10 h-10" />
                <span className="text-[10px] font-mono">SIN IMAGEN</span>
              </div>
            )}
          </div>

          {/* Información Principal del Producto */}
          <div className="space-y-1.5 mb-4">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-mono block">
              {product.categoryName || "GOSU TCG"}
            </span>

            <Link href={`/products/${product.id}`} className="block">
              <h3 className="font-extrabold text-sm text-white group-hover:text-accent-cyan transition-colors line-clamp-2 leading-snug">
                {product.title || "Producto GOSU® TCG"}
              </h3>
            </Link>

            <div className="pt-1">
              <span className="text-lg font-bold text-white font-mono block">
                {currencySymbol}{safePrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botón 'Agregar al Carrito' de Ancho Completo con Aparición Suave en Hover */}
        <div className="pt-2">
          <AddToCartButton
            productId={product.id}
            productTitle={product.title || "Producto GOSU® TCG"}
            price={safePrice}
            imageUrl={mainImg}
            className="w-full bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg opacity-100 sm:opacity-0 sm:translate-y-4 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 uppercase font-mono"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="truncate">AGREGAR AL CARRITO</span>
          </AddToCartButton>
        </div>
      </div>
    </motion.div>
  );
}
