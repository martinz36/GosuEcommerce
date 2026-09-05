"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Sparkles, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/providers/StoreProvider";

interface BentoItem {
  id: string;
  title: string;
  priceUSD: number;
  pricePEN: number;
  imageUrl?: string | null;
  categoryName?: string;
  description?: string;
}

interface BentoGalleryProps {
  products: BentoItem[];
}

export function BentoGallery({ products }: BentoGalleryProps) {
  const { addToCart } = useCartStore();
  const { currency, currencySymbol } = useStoreSettings();
  const isPEN = currency === "PEN";

  if (!products || products.length === 0) return null;

  // Seleccionar productos para la Bento Grid Asimétrica estilo Apple
  const featured = products[0];
  const item2 = products[1] || products[0];
  const item3 = products[2] || products[0];

  const handleAddToCart = (e: React.MouseEvent, p: BentoItem) => {
    e.preventDefault();
    e.stopPropagation();
    const price = isPEN ? p.pricePEN : p.priceUSD;
    addToCart({
      id: p.id,
      productId: p.id,
      title: p.title,
      price: price,
      imageUrl: p.imageUrl || undefined,
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-pink" /> SHOWCASE DE EDICIÓN LIMITADA
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight uppercase">BENTO SELECTION GOSU®</h2>
        </div>
        <span className="text-xs text-neutral-400 font-mono">
          Diseño Asimétrico • Animación Levitante ⚡
        </span>
      </div>

      {/* Contenedor Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        {/* Card 1: Tarjeta Principal Gigante con Levitación (Ocupa 2 columnas y 2 filas) */}
        {featured && (
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="md:col-span-2 md:row-span-2 relative rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 overflow-hidden group shadow-2xl flex flex-col justify-end p-8"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-black via-neutral-900 to-purple-950/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-accent-cyan text-black font-extrabold text-[10px] font-mono uppercase tracking-wider shadow-lg">
                  {featured.categoryName || "FLAGSHIP"}
                </span>
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-neutral-700 text-neutral-300 font-mono text-[10px]">
                  EDICIÓN LIMITADA
                </span>
              </div>

              <h3 className="text-2xl sm:text-4xl font-extrabold text-white uppercase tracking-tight max-w-lg leading-tight">
                {featured.title}
              </h3>

              <p className="text-neutral-400 text-xs sm:text-sm max-w-md line-clamp-2">
                {featured.description || "Ingeniería de máxima protección TCG con acabado mate antideslizante y sellado de precisión."}
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                  {currencySymbol}
                  {(isPEN ? featured.pricePEN : featured.priceUSD).toFixed(2)}
                </span>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/products/${featured.id}`}
                    className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold font-mono transition-colors flex items-center gap-1.5"
                  >
                    <span>VER DETALLES</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={(e) => handleAddToCart(e, featured)}
                    className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-accent-cyan font-extrabold text-xs font-mono transition-colors flex items-center gap-1.5 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ AGREGAR</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card 2: Tarjeta Mediana (Columna 3, Fila 1) */}
        {item2 && (
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="relative rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 overflow-hidden group shadow-xl p-6 flex flex-col justify-between"
          >
            <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
              {item2.imageUrl && (
                <img
                  src={item2.imageUrl}
                  alt={item2.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-full bg-accent-pink text-white font-bold text-[10px] font-mono uppercase tracking-wider">
                {item2.categoryName || "TOP SELLER"}
              </span>

              <button
                onClick={(e) => handleAddToCart(e, item2)}
                className="p-2.5 rounded-full bg-black/80 hover:bg-accent-cyan hover:text-black text-white border border-neutral-700 transition-colors shadow-md"
                title="Agregar al Carrito"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 space-y-1">
              <h4 className="font-bold text-sm text-white uppercase truncate">{item2.title}</h4>
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent-cyan text-sm font-extrabold">
                  {currencySymbol}
                  {(isPEN ? item2.pricePEN : item2.priceUSD).toFixed(2)}
                </span>
                <Link
                  href={`/products/${item2.id}`}
                  className="text-[11px] font-mono text-neutral-400 hover:text-white underline"
                >
                  Explorar
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card 3: Tarjeta Mediana (Columna 3, Fila 2) */}
        {item3 && (
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="relative rounded-3xl bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 overflow-hidden group shadow-xl p-6 flex flex-col justify-between"
          >
            <div className="absolute inset-0 z-0 overflow-hidden opacity-50">
              {item3.imageUrl && (
                <img
                  src={item3.imageUrl}
                  alt={item3.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-bold text-[10px] font-mono uppercase tracking-wider">
                {item3.categoryName || "PRO GEAR"}
              </span>

              <button
                onClick={(e) => handleAddToCart(e, item3)}
                className="p-2.5 rounded-full bg-black/80 hover:bg-accent-cyan hover:text-black text-white border border-neutral-700 transition-colors shadow-md"
                title="Agregar al Carrito"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10 space-y-1">
              <h4 className="font-bold text-sm text-white uppercase truncate">{item3.title}</h4>
              <div className="flex items-center justify-between">
                <span className="font-mono text-accent-pink text-sm font-extrabold">
                  {currencySymbol}
                  {(isPEN ? item3.pricePEN : item3.priceUSD).toFixed(2)}
                </span>
                <Link
                  href={`/products/${item3.id}`}
                  className="text-[11px] font-mono text-neutral-400 hover:text-white underline"
                >
                  Explorar
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
