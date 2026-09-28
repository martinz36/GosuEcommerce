"use client";

import React from "react";
import Link from "next/link";
import { Package } from "lucide-react";

interface MarqueeCardProps {
  product: {
    id: string;
    title: string;
    imageUrl?: string | null;
    secondaryImageUrl?: string | null;
    images?: { url: string }[] | null;
  };
}

export function MarqueeCard({ product }: MarqueeCardProps) {
  const imageUrl =
    product.imageUrl ||
    product.images?.[0]?.url ||
    null;

  const secondaryImageUrl =
    product.secondaryImageUrl ||
    product.images?.[1]?.url ||
    null;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block w-full space-y-2.5 transition-transform duration-300 hover:scale-[1.02]"
    >
      {/* Paso 2: Contenedor Blanco Suave con Proporción Vertical aspect-[4/5] y Espacio para Respirar */}
      <div className="aspect-[4/5] w-full bg-white rounded-2xl p-4 shadow-lg border border-white/10 relative overflow-hidden flex items-center justify-center">
        {imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={product.title}
              className={`w-full h-full object-contain transition-all duration-500 ${
                secondaryImageUrl ? "group-hover:opacity-0 group-hover:scale-105" : "group-hover:scale-105"
              }`}
            />
            {secondaryImageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={secondaryImageUrl}
                alt={product.title}
                className="w-full h-full object-contain transition-all duration-500 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 p-4"
              />
            )}
          </>
        ) : (
          <Package className="w-10 h-10 text-neutral-400" />
        )}
      </div>

      {/* Título en texto blanco sobre el fondo oscuro */}
      <div className="px-1 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-accent-cyan truncate transition-colors font-body">
          {product.title}
        </h3>
      </div>
    </Link>
  );
}
