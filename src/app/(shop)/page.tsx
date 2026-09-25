import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Package, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

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
      {/* Hero Banner Futurista Gamer TCG */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-neutral-950 py-16 sm:py-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>GOSU® OFFICIAL STORE • PERÚ & INT.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight leading-none text-white">
              EQUIPAMIENTO <span className="text-accent-cyan">PRO TCG</span> PARA JUGADORES COMPETITIVOS
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Protectores Matte Rough, carpetas Zip Armor, Deckboxes magnéticos y accesorios diseñados con máxima protección para proteger tus cartas y elevar tu nivel en torneo.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <a
                href="#catalog"
                className="w-full sm:w-auto btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3.5 px-8 transition-all flex items-center justify-center gap-2 uppercase font-mono shadow-xl"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                href="/account/dashboard"
                className="w-full sm:w-auto btn-pill bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs py-3.5 px-6 font-mono font-semibold transition-colors text-center"
              >
                Mi Cuenta & Puntos GOSU
              </Link>
            </div>

            {/* Badges de Garantía & Envíos */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-neutral-800/80 text-[11px] font-mono text-neutral-400">
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent-cyan shrink-0" />
                <span>Calidad Torneo</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <Zap className="w-4 h-4 text-accent-pink shrink-0" />
                <span>Envíos Rápidos</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-1.5">
                <Award className="w-4 h-4 text-accent-yellow shrink-0" />
                <span>GOSU Loyalty</span>
              </div>
            </div>
          </div>

          {/* Hero Card Destacado */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent-cyan via-accent-pink to-purple-600 rounded-2xl blur-lg opacity-30 animate-pulse" />
            <div className="relative bg-surface rounded-2xl border border-neutral-800 p-4 sm:p-6 space-y-4 shadow-2xl">
              <div className="aspect-square w-full rounded-xl bg-black border border-neutral-800 overflow-hidden flex items-center justify-center relative">
                {products[0]?.images?.[0]?.url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={products[0].images[0].url}
                    alt={products[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <Package className="w-16 h-16 text-neutral-700" />
                )}
                <span className="absolute top-3 left-3 bg-accent-pink text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                  BEST SELLER
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-mono text-accent-cyan uppercase tracking-widest block">DESTACADO</span>
                  <h3 className="font-bold text-xs text-white truncate max-w-[140px] sm:max-w-[200px]">{products[0]?.title}</h3>
                </div>
                <span className="font-mono font-extrabold text-xs sm:text-sm text-accent-pink">
                  {isPEN ? `S/. ${Number(products[0]?.pricePEN || Number(products[0]?.basePrice) * 3.75).toFixed(2)}` : `$${Number(products[0]?.priceUSD || products[0]?.basePrice).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transición Suave de Negro a Lienzo Claro para el Catálogo */}
      <div className="h-20 bg-gradient-to-b from-black via-neutral-950 to-neutral-50" />

      {/* Sección del Catálogo de Productos en Lienzo Claro */}
      <section id="catalog" className="bg-neutral-50 text-slate-900 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-700 uppercase tracking-widest block mb-1">
                PRODUCTOS DISPONIBLES EN NEON DB
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase text-slate-900">
                CATÁLOGO DE PRODUCTOS
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => {
              return (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    title: product.title,
                    priceUSD: Number(product.priceUSD || product.basePrice),
                    pricePEN: Number(product.pricePEN || (Number(product.basePrice) * 3.75).toFixed(2)),
                    compareAtPriceUSD: product.compareAtPriceUSD ? Number(product.compareAtPriceUSD) : null,
                    compareAtPricePEN: product.compareAtPricePEN ? Number(product.compareAtPricePEN) : null,
                    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
                    badgeText: product.badgeText,
                    isNew: product.isNew,
                    stock: product.stock,
                    imageUrl: product.images?.[0]?.url || null,
                    secondaryImageUrl: product.images?.[1]?.url || null,
                    images: product.images,
                    isFamily: product.isFamily,
                    familyId: product.familyId,
                    categoryName: product.category?.name || "Accesorios TCG",
                  }}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Transición Suave de Lienzo Claro de Vuelta a Negro hacia el Footer */}
      <div className="h-20 bg-gradient-to-b from-neutral-50 via-neutral-950 to-black" />
    </div>
  );
}
