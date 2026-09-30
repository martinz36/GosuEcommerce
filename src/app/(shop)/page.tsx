import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { HomeProductCarousel } from "@/components/HomeProductCarousel";

export const revalidate = 0;

export default async function HomePage() {
  const cookieStore = cookies();
  const userCountry = cookieStore.get("user-country")?.value || "PE";
  const userCurrencyPref = cookieStore.get("user-currency")?.value;
  const isPEN = userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref);

  let products: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
          images: true,
        },
        orderBy: { createdAt: "desc" },
        take: 12,
      });
    }
  } catch (err) {
    console.error("Error al obtener productos de Neon DB:", err);
  }

  // Pick up to 4 items for the hero floating showcase
  const heroProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-accent-cyan selection:text-black">
      {/* Hero Banner Estilo Imagen 1 - Centrado con Tipografía Impactante */}
      <section className="relative overflow-hidden border-b border-neutral-900 bg-neutral-950 py-16 sm:py-24 md:py-28 px-4 sm:px-6">
        {/* Fondo Texturizado Oscuro */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(35,35,40,0.6)_0%,rgba(5,5,5,0.95)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Tarjetas Flotantes Izquierda (Desktop) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 items-center lg:items-end justify-center">
              {/* Card 1: Top Left */}
              {heroProducts[0] ? (
                <Link
                  href={`/product/${heroProducts[0].slug}`}
                  className="group relative w-56 rounded-xl bg-neutral-900/80 border border-neutral-800 p-3 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-neutral-600 -rotate-2 hover:rotate-0"
                >
                  <div className="aspect-square w-full rounded-lg bg-black/60 overflow-hidden flex items-center justify-center relative">
                    {heroProducts[0].images?.[0]?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={heroProducts[0].images[0].url}
                        alt={heroProducts[0].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-neutral-700" />
                    )}
                    <span className="absolute top-2 left-2 bg-accent-green text-black font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      PRO SLEEVES
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-200 truncate max-w-[120px]">
                      {heroProducts[0].title}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-accent-cyan">
                      {isPEN
                        ? `S/. ${Number(heroProducts[0].pricePEN || Number(heroProducts[0].basePrice) * 3.75).toFixed(2)}`
                        : `$${Number(heroProducts[0].priceUSD || heroProducts[0].basePrice).toFixed(2)}`}
                    </span>
                  </div>
                </Link>
              ) : null}

              {/* Card 2: Bottom Left */}
              {heroProducts[1] ? (
                <Link
                  href={`/product/${heroProducts[1].slug}`}
                  className="group relative w-56 rounded-xl bg-neutral-900/80 border border-neutral-800 p-3 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-neutral-600 rotate-2 hover:rotate-0"
                >
                  <div className="aspect-square w-full rounded-lg bg-black/60 overflow-hidden flex items-center justify-center relative">
                    {heroProducts[1].images?.[0]?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={heroProducts[1].images[0].url}
                        alt={heroProducts[1].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-neutral-700" />
                    )}
                    <span className="absolute top-2 left-2 bg-accent-pink text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      DECK BOX
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-200 truncate max-w-[120px]">
                      {heroProducts[1].title}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-accent-pink">
                      {isPEN
                        ? `S/. ${Number(heroProducts[1].pricePEN || Number(heroProducts[1].basePrice) * 3.75).toFixed(2)}`
                        : `$${Number(heroProducts[1].priceUSD || heroProducts[1].basePrice).toFixed(2)}`}
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>

            {/* Titular Principal Stacked Centrado (Imagen 1) */}
            <div className="lg:col-span-6 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono font-semibold tracking-wider uppercase">
                <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
                <span>GOSU® TCG ACCESSORIES STORE</span>
              </div>

              {/* Stacked Main Title */}
              <div className="flex flex-col items-center justify-center space-y-0 text-center select-none">
                <h1 className="font-hero-headline text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.88] text-white uppercase drop-shadow-md">
                  PARA
                </h1>
                <h1 className="font-hero-headline text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.88] text-white uppercase drop-shadow-md">
                  QUIENES
                </h1>
                <h1 className="font-hero-headline text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.88] text-white uppercase drop-shadow-md">
                  JUEGAN
                </h1>
                <div className="pt-1 sm:pt-2">
                  <span className="font-brush-accent text-accent-pink text-5xl sm:text-7xl md:text-8xl tracking-wide leading-[0.9] text-center -rotate-2 transform inline-block drop-shadow-[0_0_25px_rgba(255,9,187,0.6)]">
                    DIFERENTE
                  </span>
                </div>
              </div>

              {/* Subtítulo Estilo Imagen 1 */}
              <p className="font-sans text-xs sm:text-sm md:text-base font-semibold tracking-[0.12em] sm:tracking-[0.18em] text-neutral-300 max-w-2xl mx-auto uppercase leading-relaxed pt-2">
                ACCESORIOS DE ALTA CALIDAD DISEÑADOS PARA PROTEGER, OPTIMIZAR Y FLEXIBILIZAR TU COLECCIÓN – COMO SE MERECE
              </p>

              {/* Botones Call-to-action */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/catalog"
                  className="w-full sm:w-auto btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3.5 px-8 transition-all flex items-center justify-center gap-2 uppercase font-mono shadow-xl"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/account/dashboard"
                  className="w-full sm:w-auto btn-pill bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs py-3.5 px-6 font-mono font-semibold transition-colors text-center"
                >
                  Mi Cuenta & Puntos GOSU
                </Link>
              </div>

              {/* Badges de Calidad */}
              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-neutral-900 text-[11px] font-mono text-neutral-400 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-accent-cyan shrink-0" />
                  <span>Calidad Torneo</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4 text-accent-pink shrink-0" />
                  <span>Envíos Rápidos</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Award className="w-4 h-4 text-accent-yellow shrink-0" />
                  <span>GOSU Loyalty</span>
                </div>
              </div>
            </div>

            {/* Tarjetas Flotantes Derecha (Desktop) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 items-center lg:items-start justify-center">
              {/* Card 3: Top Right */}
              {heroProducts[2] ? (
                <Link
                  href={`/product/${heroProducts[2].slug}`}
                  className="group relative w-56 rounded-xl bg-neutral-900/80 border border-neutral-800 p-3 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-neutral-600 rotate-2 hover:rotate-0"
                >
                  <div className="aspect-square w-full rounded-lg bg-black/60 overflow-hidden flex items-center justify-center relative">
                    {heroProducts[2].images?.[0]?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={heroProducts[2].images[0].url}
                        alt={heroProducts[2].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-neutral-700" />
                    )}
                    <span className="absolute top-2 left-2 bg-accent-cyan text-black font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      BINDER 9-POCKET
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-200 truncate max-w-[120px]">
                      {heroProducts[2].title}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-accent-cyan">
                      {isPEN
                        ? `S/. ${Number(heroProducts[2].pricePEN || Number(heroProducts[2].basePrice) * 3.75).toFixed(2)}`
                        : `$${Number(heroProducts[2].priceUSD || heroProducts[2].basePrice).toFixed(2)}`}
                    </span>
                  </div>
                </Link>
              ) : null}

              {/* Card 4: Bottom Right */}
              {heroProducts[3] ? (
                <Link
                  href={`/product/${heroProducts[3].slug}`}
                  className="group relative w-56 rounded-xl bg-neutral-900/80 border border-neutral-800 p-3 shadow-2xl transition-all duration-300 hover:scale-105 hover:border-neutral-600 -rotate-2 hover:rotate-0"
                >
                  <div className="aspect-square w-full rounded-lg bg-black/60 overflow-hidden flex items-center justify-center relative">
                    {heroProducts[3].images?.[0]?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={heroProducts[3].images[0].url}
                        alt={heroProducts[3].title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-neutral-700" />
                    )}
                    <span className="absolute top-2 left-2 bg-accent-yellow text-black font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      MATTE SLEEVES
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-200 truncate max-w-[120px]">
                      {heroProducts[3].title}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-accent-yellow">
                      {isPEN
                        ? `S/. ${Number(heroProducts[3].pricePEN || Number(heroProducts[3].basePrice) * 3.75).toFixed(2)}`
                        : `$${Number(heroProducts[3].priceUSD || heroProducts[3].basePrice).toFixed(2)}`}
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>

          </div>

          {/* Versión Mobile: Grid de Productos Destacados abajo del Título */}
          {heroProducts.length > 0 && (
            <div className="mt-12 lg:hidden grid grid-cols-2 gap-4">
              {heroProducts.slice(0, 4).map((item, idx) => (
                <Link
                  key={item.id || idx}
                  href={`/product/${item.slug}`}
                  className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 flex flex-col justify-between shadow-lg"
                >
                  <div className="aspect-square rounded-lg bg-black/60 overflow-hidden relative flex items-center justify-center">
                    {item.images?.[0]?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-10 h-10 text-neutral-700" />
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs font-bold truncate text-white">{item.title}</p>
                    <p className="text-xs font-mono font-extrabold text-accent-pink">
                      {isPEN
                        ? `S/. ${Number(item.pricePEN || Number(item.basePrice) * 3.75).toFixed(2)}`
                        : `$${Number(item.priceUSD || item.basePrice).toFixed(2)}`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Sección del Carrusel Interactivo de Productos con Filtros por Categoría */}
      <HomeProductCarousel products={products} />
    </div>
  );
}
