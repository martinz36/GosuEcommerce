"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ProductCard } from "./ProductCard";

interface ProductItem {
  id: string;
  title: string;
  description?: string | null;
  priceUSD?: number | null;
  pricePEN?: number | null;
  compareAtPriceUSD?: number | null;
  compareAtPricePEN?: number | null;
  compareAtPrice?: number | null;
  basePrice?: number | null;
  stock?: number | null;
  imageUrl?: string | null;
  secondaryImageUrl?: string | null;
  images?: { url: string }[] | null;
  badgeText?: string | null;
  isNew?: boolean | null;
  isFamily?: boolean | null;
  familyId?: string | null;
  productType?: string | null;
  categoryName?: string | null;
}

interface HomeProductCarouselProps {
  products: ProductItem[];
}

const CATEGORY_TABS = ["Todo", "Sleeves", "Deckboxes", "Binders"];

export function HomeProductCarousel({ products }: HomeProductCarouselProps) {
  const [activeTab, setActiveTab] = useState("Todo");

  // Configuración estricta de Autoplay: delay 3000ms, stopOnInteraction: false, stopOnMouseEnter: true
  const autoplayPlugin = useMemo(() => {
    return Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true });
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
    },
    [autoplayPlugin]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Filtrado dinámico por categoría / pestaña activa
  const filteredProducts = useMemo(() => {
    if (activeTab === "Todo") return products;

    return products.filter((p) => {
      const cat = (p.categoryName || "").toLowerCase();
      const type = (p.productType || "").toLowerCase();
      const title = (p.title || "").toLowerCase();

      if (activeTab === "Sleeves") {
        return cat.includes("sleeve") || type.includes("sleeve") || title.includes("sleeve") || cat.includes("funda") || title.includes("funda");
      }
      if (activeTab === "Deckboxes") {
        return cat.includes("deck") || type.includes("deck") || title.includes("deck") || cat.includes("box") || title.includes("box") || title.includes("portamazo");
      }
      if (activeTab === "Binders") {
        return cat.includes("binder") || type.includes("binder") || title.includes("binder") || cat.includes("carpeta") || title.includes("carpeta");
      }
      return true;
    });
  }, [products, activeTab]);

  return (
    <section className="bg-neutral-950 text-white py-16 px-4 sm:px-6 font-body border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Cabecera & Menú de Pestañas de Categoría (Tabs) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-accent-cyan uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EQUIPAMIENTO DESTACADO GOSU®</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              PRODUCTOS POPULARES
            </h2>
          </div>

          {/* Menú de Pestañas de Categorías (Sin scrollbars nativas) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-x-auto shrink-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-accent-cyan text-black shadow-md shadow-cyan-900/30"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800/60"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Carrusel Interactivo Embla con Autoplay y Máscara de Desvanecimiento */}
        <div className="relative group">
          
          {/* Flecha Izquierda (z-30 sobre el contenedor difuminado) */}
          <button
            onClick={scrollPrev}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/90 border border-neutral-700 text-white hover:text-accent-cyan hover:border-accent-cyan transition-all flex items-center justify-center shadow-xl opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:outline-none"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Paso 1: Contenedor con Máscara Afinada de Desvanecimiento (3% y 97%) */}
          <div className="[mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
            {/* Viewport de Embla con Scrollbars Ocultas */}
            <div
              ref={emblaRef}
              className="overflow-hidden py-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* Embla Track */}
              <div className="flex items-stretch gap-4 sm:gap-6 -ml-4 sm:-ml-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="pl-4 sm:pl-6 min-w-0 flex-none w-[280px] sm:w-[320px] lg:w-[340px]"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))
                ) : (
                  <div className="w-full p-12 text-center bg-neutral-900/60 border border-neutral-800 rounded-2xl font-mono text-xs text-neutral-400">
                    No hay productos disponibles en la categoría {activeTab}.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Flecha Derecha (z-30 sobre el contenedor difuminado) */}
          <button
            onClick={scrollNext}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/90 border border-neutral-700 text-white hover:text-accent-cyan hover:border-accent-cyan transition-all flex items-center justify-center shadow-xl opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:outline-none"
            title="Siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Llamada a la Acción (CTA) Final */}
        <div className="flex justify-center pt-4">
          <Link
            href="/catalog"
            className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-accent-cyan text-xs font-mono font-bold text-white transition-all shadow-lg hover:shadow-cyan-900/20"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4 text-accent-cyan group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
