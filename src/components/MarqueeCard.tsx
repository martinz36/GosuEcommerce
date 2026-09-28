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
      className="group block w-44 sm:w-52 shrink-0 bg-neutral-900/60 hover:bg-neutral-900 border border-neutral-800 hover:border-accent-cyan/50 rounded-xl overflow-hidden transition-all duration-300"
    >
      {/* Paso 2: Contenedor Cuadrado de la Imagen (aspect-square) */}
      <div className="aspect-square w-full bg-black relative overflow-hidden flex items-center justify-center p-2">
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
                className="w-full h-full object-contain transition-all duration-500 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 p-2"
              />
            )}
          </>
        ) : (
          <Package className="w-10 h-10 text-neutral-700" />
        )}
      </div>

      {/* Paso 1: Título Minimalista Truncado a 1 Línea (Sin precio ni botones) */}
      <div className="p-2.5 text-center">
        <h3 className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-accent-cyan truncate transition-colors font-body">
          {product.title}
        </h3>
      </div>
    </Link>
  );
}
