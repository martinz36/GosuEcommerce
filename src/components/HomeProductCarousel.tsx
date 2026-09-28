"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { MarqueeCard } from "./MarqueeCard";

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

export function HomeProductCarousel({ products }: HomeProductCarouselProps) {
  // Paso 2: Preparar los datos (Split en 2 filas)
  const row1Products = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length <= 6) return [...products, ...products, ...products];
    const half = Math.ceil(products.length / 2);
    return products.slice(0, half);
  }, [products]);

  const row2Products = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (products.length <= 6) return [...products, ...products, ...products].reverse();
    const half = Math.ceil(products.length / 2);
    return products.slice(half);
  }, [products]);

  // Paso 1: Fila Superior (Instancia Embla independiente: forward, playOnInit: true)
  const [emblaRefRow1] = useEmblaCarousel(
    { loop: true, dragFree: true },
    [
      AutoScroll({
        playOnInit: true,
        speed: 1.5,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        direction: "forward",
      }),
    ]
  );

  // Paso 1: Fila Inferior (Instancia Embla independiente: backward, playOnInit: true)
  const [emblaRefRow2] = useEmblaCarousel(
    { loop: true, dragFree: true },
    [
      AutoScroll({
        playOnInit: true,
        speed: 1.5,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        direction: "backward",
      }),
    ]
  );

  return (
    <section className="bg-neutral-950 text-white py-14 px-4 sm:px-6 font-body border-b border-neutral-800/80 overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Paso 1: Limpieza de UI - Título alineado a la izquierda sin pestañas */}
        <div className="border-b border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-accent-cyan uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EQUIPAMIENTO DESTACADO GOSU®</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              PRODUCTOS POPULARES
            </h2>
          </div>
        </div>

        {/* Doble Instancia de Embla con MarqueeCard Densas y Separación Ajustada */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Fila 1 (Forward + MarqueeCard + Mask 3% + gap-3) */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
            <div
              ref={emblaRefRow1}
              className="overflow-hidden py-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="flex items-stretch gap-3 sm:gap-4 -ml-3 sm:-ml-4">
                {row1Products.map((product, idx) => (
                  <div
                    key={`row1-${product.id}-${idx}`}
                    className="pl-3 sm:pl-4 min-w-0 flex-none w-44 sm:w-52"
                  >
                    <MarqueeCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fila 2 (Backward + MarqueeCard + Mask 3% + gap-3) */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
            <div
              ref={emblaRefRow2}
              className="overflow-hidden py-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div className="flex items-stretch gap-3 sm:gap-4 -ml-3 sm:-ml-4">
                {row2Products.map((product, idx) => (
                  <div
                    key={`row2-${product.id}-${idx}`}
                    className="pl-3 sm:pl-4 min-w-0 flex-none w-44 sm:w-52"
                  >
                    <MarqueeCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

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
