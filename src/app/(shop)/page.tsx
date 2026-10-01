import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Award } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-black text-white font-body selection:bg-accent-cyan selection:text-black">
      {/* Hero Banner Estilo Imagen 1 & 4 + GOSU GANG & Sleeves Background */}
      <section className="relative overflow-hidden border-b border-neutral-900 bg-black py-16 sm:py-24 md:py-28 px-4 sm:px-6">
        
        {/* Imagen de Fondo Principal (Sleeves Photoshot Oficial) - Visible y Vibrante */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-85 pointer-events-none"
          style={{ backgroundImage: `url('/hero-sleeves-bg.jpg')` }}
        />

        {/* Textura de Fondo Halftone + Pliegue de Papel (Imagen 4) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen pointer-events-none"
          style={{ backgroundImage: `url('/hero-bg-texture.png')` }}
        />

        {/* Degradado Suave para Equilibrio de Legibilidad sin Oscurecer el Fondo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/80 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Mascotas Flotantes Izquierda (GOSU GANG Desktop) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 items-center lg:items-end justify-center">
              {/* Mascota 1: Raccoon */}
              <div className="group relative w-48 sm:w-56 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 hover:border-accent-cyan/80 -rotate-3 hover:rotate-0 flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-b from-white/20 via-neutral-800/60 to-black/80 border border-white/10 flex items-center justify-center p-3 overflow-hidden shadow-inner relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/gosu-gang/RACCOON.png"
                    alt="GOSU Raccoon"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.85)] group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="mt-2.5 bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan font-mono text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  RACCOON • GOSU GANG
                </span>
              </div>

              {/* Mascota 2: Fox */}
              <div className="group relative w-48 sm:w-56 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 hover:border-accent-pink/80 rotate-3 hover:rotate-0 flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-b from-white/20 via-neutral-800/60 to-black/80 border border-white/10 flex items-center justify-center p-3 overflow-hidden shadow-inner relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/gosu-gang/FOX.png"
                    alt="GOSU Fox"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.85)] group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="mt-2.5 bg-accent-pink/20 border border-accent-pink/40 text-accent-pink font-mono text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  FOX • GOSU GANG
                </span>
              </div>
            </div>

            {/* Titular Principal Stacked Centrado */}
            <div className="lg:col-span-6 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 border border-neutral-700 backdrop-blur-md text-neutral-200 text-xs font-mono font-semibold tracking-wider uppercase shadow-xl">
                <Sparkles className="w-4 h-4 text-accent-cyan animate-pulse" />
                <span>GOSU® TCG ACCESSORIES STORE</span>
              </div>

              {/* Stacked Main Title */}
              <div className="flex flex-col items-center justify-center space-y-0 text-center select-none">
                <h1 className="font-hero-headline text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.88] text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  PARA
                </h1>
                <h1 className="font-hero-headline text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.88] text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  QUIENES
                </h1>
                <h1 className="font-hero-headline text-5xl sm:text-7xl md:text-8xl tracking-tight leading-[0.88] text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                  JUEGAN
                </h1>
                <div className="pt-1 sm:pt-2">
                  <span className="font-brush-accent text-accent-pink text-5xl sm:text-7xl md:text-8xl tracking-wide leading-[0.9] text-center -rotate-2 transform inline-block drop-shadow-[0_0_30px_rgba(255,9,187,0.8)]">
                    DIFERENTE
                  </span>
                </div>
              </div>

              {/* Subtítulo Estilo Imagen 1 */}
              <p className="font-sans text-xs sm:text-sm md:text-base font-semibold tracking-[0.12em] sm:tracking-[0.18em] text-neutral-100 max-w-2xl mx-auto uppercase leading-relaxed pt-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                ACCESORIOS DE ALTA CALIDAD DISEÑADOS PARA PROTEGER, OPTIMIZAR Y FLEXIBILIZAR TU COLECCIÓN – COMO SE MERECE
              </p>

              {/* Botones Call-to-action */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href="/catalog"
                  className="w-full sm:w-auto btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3.5 px-8 transition-all flex items-center justify-center gap-2 uppercase font-mono shadow-2xl hover:scale-105"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/account/dashboard"
                  className="w-full sm:w-auto btn-pill bg-neutral-900/90 hover:bg-neutral-800 text-white border border-neutral-700 text-xs py-3.5 px-6 font-mono font-semibold transition-all backdrop-blur-md text-center"
                >
                  Mi Cuenta & Puntos GOSU
                </Link>
              </div>

              {/* Badges de Calidad */}
              <div className="grid grid-cols-3 gap-2 pt-6 border-t border-neutral-700/60 text-[11px] font-mono text-neutral-200 max-w-lg mx-auto">
                <div className="flex items-center justify-center gap-1.5 bg-black/40 py-1.5 px-2 rounded-lg border border-neutral-800">
                  <ShieldCheck className="w-4 h-4 text-accent-cyan shrink-0" />
                  <span>Calidad Torneo</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-black/40 py-1.5 px-2 rounded-lg border border-neutral-800">
                  <Zap className="w-4 h-4 text-accent-pink shrink-0" />
                  <span>Envíos Rápidos</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 bg-black/40 py-1.5 px-2 rounded-lg border border-neutral-800">
                  <Award className="w-4 h-4 text-accent-yellow shrink-0" />
                  <span>GOSU Loyalty</span>
                </div>
              </div>
            </div>

            {/* Mascotas Flotantes Derecha (GOSU GANG Desktop) */}
            <div className="hidden lg:flex lg:col-span-3 flex-col gap-8 items-center lg:items-start justify-center">
              {/* Mascota 3: Bear */}
              <div className="group relative w-48 sm:w-56 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 hover:border-accent-yellow/80 rotate-2 hover:rotate-0 flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-b from-white/20 via-neutral-800/60 to-black/80 border border-white/10 flex items-center justify-center p-3 overflow-hidden shadow-inner relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/gosu-gang/BEAR.png"
                    alt="GOSU Bear"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.85)] group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="mt-2.5 bg-accent-yellow/20 border border-accent-yellow/40 text-accent-yellow font-mono text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  BEAR • GOSU GANG
                </span>
              </div>

              {/* Mascota 4: Bunny */}
              <div className="group relative w-48 sm:w-56 p-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-105 hover:border-accent-green/80 -rotate-2 hover:rotate-0 flex flex-col items-center">
                <div className="w-full aspect-square rounded-xl bg-gradient-to-b from-white/20 via-neutral-800/60 to-black/80 border border-white/10 flex items-center justify-center p-3 overflow-hidden shadow-inner relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/gosu-gang/BUNNY.png"
                    alt="GOSU Bunny"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.85)] group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="mt-2.5 bg-accent-green/20 border border-accent-green/40 text-accent-green font-mono text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  BUNNY • GOSU GANG
                </span>
              </div>
            </div>

          </div>

          {/* Versión Mobile: Tira de Mascotas GOSU GANG */}
          <div className="mt-12 lg:hidden flex items-center justify-center gap-3 overflow-x-auto pb-4 scrollbar-none">
            {[
              { name: "RACCOON", img: "/gosu-gang/RACCOON.png", color: "border-accent-cyan text-accent-cyan" },
              { name: "FOX", img: "/gosu-gang/FOX.png", color: "border-accent-pink text-accent-pink" },
              { name: "BEAR", img: "/gosu-gang/BEAR.png", color: "border-accent-yellow text-accent-yellow" },
              { name: "BUNNY", img: "/gosu-gang/BUNNY.png", color: "border-accent-green text-accent-green" },
              { name: "TURTLE", img: "/gosu-gang/TURTLE.png", color: "border-accent-orange text-accent-orange" },
            ].map((m, idx) => (
              <div
                key={idx}
                className="bg-neutral-900/90 border border-neutral-700 rounded-xl p-2 flex flex-col items-center min-w-[110px] shrink-0 shadow-lg"
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-b from-white/20 to-black/60 flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.img}
                    alt={m.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]"
                  />
                </div>
                <span className={`mt-1.5 font-mono text-[9px] font-extrabold border px-2 py-0.5 rounded-full uppercase ${m.color}`}>
                  {m.name}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Sección del Carrusel Interactivo de Productos con Filtros por Categoría */}
      <HomeProductCarousel products={products} />
    </div>
  );
}
