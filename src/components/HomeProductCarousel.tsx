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
  // Paso 2: Preparar los datos y duplicar arrays (Loop Filler para 1080p y 4K)
  const row1Products = useMemo(() => {
    if (!products || products.length === 0) return [];
    const half = Math.ceil(products.length / 2);
    return products.slice(0, half);
  }, [products]);

  const row2Products = useMemo(() => {
    if (!products || products.length === 0) return [];
    const half = Math.ceil(products.length / 2);
    return products.slice(half);
  }, [products]);

  // Duplicación forzosa para loop infinito perfecto sin stuttering
  const infiniteRow1 = useMemo(() => {
    if (row1Products.length === 0) return [];
    return [...row1Products, ...row1Products, ...row1Products, ...row1Products];
  }, [row1Products]);

  const infiniteRow2 = useMemo(() => {
    if (row2Products.length === 0) return [];
    return [...row2Products, ...row2Products, ...row2Products, ...row2Products];
  }, [row2Products]);

  // Paso 3: Parámetros del Hook con align: 'start'
  const [emblaRefRow1] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
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

  const [emblaRefRow2] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
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
        
        {/* Cabecera limpia alineada a la izquierda */}
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

        {/* Doble Escaparate con CSS Estricto de Embla y Loop Filler */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* Fila 1 (Forward + Mask 3% + Método Oficial Embla: -ml-4 sm:-ml-6 & pl-4 sm:pl-6) */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
            {/* Viewport */}
            <div ref={emblaRefRow1} className="overflow-hidden">
              {/* Track con margen negativo (sin gap) */}
              <div className="flex -ml-4 sm:-ml-6">
                {infiniteRow1.map((product, idx) => (
                  /* Slide con padding izquierdo para mantener el espacio uniforme en la costura de loop */
                  <div
                    key={`row1-${product.id}-${idx}`}
                    className="flex-[0_0_auto] min-w-0 pl-4 sm:pl-6 w-44 sm:w-52"
                  >
                    <MarqueeCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fila 2 (Backward + Mask 3% + Método Oficial Embla: -ml-4 sm:-ml-6 & pl-4 sm:pl-6) */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
            {/* Viewport */}
            <div ref={emblaRefRow2} className="overflow-hidden">
              {/* Track con margen negativo (sin gap) */}
              <div className="flex -ml-4 sm:-ml-6">
                {infiniteRow2.map((product, idx) => (
                  /* Slide con padding izquierdo para mantener el espacio uniforme en la costura de loop */
                  <div
                    key={`row2-${product.id}-${idx}`}
                    className="flex-[0_0_auto] min-w-0 pl-4 sm:pl-6 w-44 sm:w-52"
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
