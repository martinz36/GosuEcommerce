"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Image as ImageIcon } from "lucide-react";
import { hoverScaleProps, smoothEase } from "@/lib/motion";

export interface ProductCardProps {
  id: string;
  title: string;
  price: string | number;
  compareAtPrice?: string | number | null;
  imageUrl?: string | null;
  categoryName?: string;
  badge?: string;
  badgeColor?: string;
}

export function ProductCard({
  id,
  title,
  price,
  compareAtPrice,
  imageUrl,
  categoryName = "Accesorios TCG",
  badge,
  badgeColor = "bg-accent-cyan text-black",
}: ProductCardProps) {
  const formattedPrice = typeof price === "number" ? `$${price.toFixed(2)}` : price;
  const formattedCompareAt = compareAtPrice
    ? typeof compareAtPrice === "number"
      ? `$${compareAtPrice.toFixed(2)}`
      : compareAtPrice
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={smoothEase}
      whileHover={{ y: -6 }}
      className="group bg-surface rounded-card border border-neutral-800 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-neutral-600 hover:shadow-card"
    >
      <Link href={`/products/${id}`} className="block flex-1">
        {/* Contenedor de Imagen de Cloudinary con Zoom Framer Motion */}
        <div className="relative aspect-square overflow-hidden bg-neutral-950 flex items-center justify-center">
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt={title}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-600">
              <ImageIcon className="w-10 h-10 stroke-[1.5]" />
              <span className="text-[11px] font-mono uppercase tracking-wider">Sin Imagen</span>
            </div>
          )}

          {/* Badge del Producto */}
          {badge && (
            <div className="absolute top-3 left-3 z-10">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider shadow-sm ${badgeColor}`}>
                {badge}
              </span>
            </div>
          )}
        </div>

        {/* Ficha Técnica Corta */}
        <div className="p-6">
          <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-2">
            {categoryName}
          </span>
          <h3 className="font-bold text-lg leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">
            {title}
          </h3>
        </div>
      </Link>

      {/* Pie de Tarjeta - Precio y Botón de Acción */}
      <div className="p-6 pt-0 flex items-center justify-between mt-auto">
        <div>
          <span className="text-xl font-black text-white">{formattedPrice}</span>
          {formattedCompareAt && (
            <span className="text-sm text-neutral-500 line-through ml-2 font-mono">
              {formattedCompareAt}
            </span>
          )}
        </div>

        <motion.button
          {...hoverScaleProps}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log(`Agregar producto ${id} - ${title} al carrito`);
          }}
          className="btn-pill bg-white text-black font-bold hover:bg-accent-cyan transition-colors flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Agregar</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
