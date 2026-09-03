import React from "react";
import Link from "next/link";
import { Sparkles, Zap, ShieldCheck, Users, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { BundleSection } from "@/components/BundleSection";

export const revalidate = 0;

export default async function ShopHomePage() {
  // 1. Consulta RSC a Neon Postgres con timeout protector de 3.5s para Vercel Serverless
  let dbProducts: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      const fetchPromise = prisma.product.findMany({
        where: { isActive: true },
        include: {
          images: true,
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout conectando a Neon DB")), 3500)
      );

      dbProducts = (await Promise.race([fetchPromise, timeoutPromise])) as any[];
    }
  } catch (error) {
    console.error("Nota: Consulta a Neon DB en proceso:", error);
  }

  // 2. Productos de demostración si la base de datos es nueva
  const mockProducts = [
    {
      id: "demo-1",
      title: "GOSU® Armor Sleeves - Japanese Size (Matte Black)",
      price: 14.99,
      compareAtPrice: 19.99,
      badge: "BESTSELLER",
      badgeColor: "bg-accent-cyan text-black",
      categoryName: "Sleeves",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: "demo-2",
      title: "PRO Collector Bundle (3x Sleeves + 1x Binder + Deck Box)",
      price: 49.99,
      compareAtPrice: 69.99,
      badge: "PACK / BUNDLE -28%",
      badgeColor: "bg-accent-pink text-white font-bold",
      categoryName: "Bundles",
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: "demo-3",
      title: "GOSU® Toploader Binder (9-Pocket Zip Armor)",
      price: 34.99,
      compareAtPrice: null,
      badge: "AFFILIATE SPECIAL",
      badgeColor: "bg-accent-yellow text-black",
      categoryName: "Binders",
      imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60",
    },
  ];

  const displayProducts =
    dbProducts && dbProducts.length > 0
      ? dbProducts.map((p) => ({
          id: p.id,
          title: p.title,
          price: Number(p.basePrice),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          imageUrl: p.images[0]?.url || null,
          categoryName: p.category?.name || "Accesorios TCG",
          badge: p.isFeatured ? "DESTACADO" : undefined,
          badgeColor: "bg-accent-cyan text-black",
        }))
      : mockProducts;

  return (
    <div className="space-y-16">
      {/* Hero Section Público */}
      <section className="relative overflow-hidden py-24 px-6 border-b border-surface-muted">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-cyan/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-elevated border border-neutral-800 text-xs font-mono text-accent-cyan mb-8">
            <Sparkles className="w-4 h-4 text-accent-pink" />
            <span>EQUIPAMIENTO TCG ALIMENTADO POR NEON POSTGRES</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase leading-none mb-6">
            PROTECCIÓN <span className="text-accent-cyan">PREMIUM</span> PARA TUS CARTAS MÁS VALIOSAS
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10">
            Fundas de corte competitivo, carpetas toploader acolchadas y bundles exclusivos diseñados para jugadores y coleccionistas.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#catalog"
              className="btn-pill bg-white text-black font-bold border border-white hover:bg-accent-cyan hover:border-accent-cyan transition-colors"
            >
              Ver Catálogo Completo
            </a>
            <a
              href="#bundles"
              className="btn-pill glass-panel text-white font-medium border border-neutral-700 hover:border-accent-pink transition-colors"
            >
              Packs & Bundles
            </a>
          </div>
        </div>
      </section>

      {/* Grid de Destacados de Tienda */}
      <section className="py-6 px-6 bg-surface border-y border-surface-muted">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-black rounded-card border border-neutral-800 flex items-start gap-4">
            <div className="p-3 bg-accent-cyan/10 rounded-lg text-accent-cyan">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Packs & Bundles Dinámicos</h3>
              <p className="text-xs text-neutral-400">Agrupa productos con precios promocionales y stock sincronizado en tiempo real.</p>
            </div>
          </div>

          <div className="p-6 bg-black rounded-card border border-neutral-800 flex items-start gap-4">
            <div className="p-3 bg-accent-pink/10 rounded-lg text-accent-pink">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Sistema de Afiliados y Referidos</h3>
              <p className="text-xs text-neutral-400">Genera códigos de creador con seguimiento automático de comisiones por orden.</p>
            </div>
          </div>

          <div className="p-6 bg-black rounded-card border border-neutral-800 flex items-start gap-4">
            <div className="p-3 bg-accent-green/10 rounded-lg text-accent-green">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Pagos Seguros con Stripe</h3>
              <p className="text-xs text-neutral-400">Checkout optimizado con soporte para cupones, impuestos y webhooks en tiempo real.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Paso 2: Componente de Packs (BundleSection) */}
      <BundleSection />

      {/* Paso 3: El Catálogo Principal (Grilla Responsiva CSS Grid) */}
      <section id="catalog" className="py-12 px-6 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">CATÁLOGO COMPLETO</h2>
            <p className="text-neutral-400 text-sm mt-1">
              Productos consultados directamente desde la base de datos Neon vía Prisma ORM
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex gap-2 font-mono text-xs overflow-x-auto pb-2">
            <button className="px-4 py-2 rounded-full bg-white text-black font-bold shrink-0">TODOS</button>
            <button className="px-4 py-2 rounded-full bg-surface-elevated text-neutral-300 hover:text-white border border-neutral-800 shrink-0">SLEEVES</button>
            <button className="px-4 py-2 rounded-full bg-surface-elevated text-neutral-300 hover:text-white border border-neutral-800 shrink-0">BINDERS</button>
            <button className="px-4 py-2 rounded-full bg-surface-elevated text-neutral-300 hover:text-white border border-neutral-800 shrink-0">PACKS</button>
          </div>
        </div>

        {/* Grilla Responsiva (CSS Grid) con ProductCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              imageUrl={product.imageUrl}
              categoryName={product.categoryName}
              badge={product.badge}
              badgeColor={product.badgeColor}
            />
          ))}
        </div>
      </section>

      {/* Banner de Afiliados */}
      <section id="affiliates" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-surface rounded-2xl border border-neutral-800 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-accent-pink/10 blur-[100px] pointer-events-none" />

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-accent-pink text-xs font-mono mb-4">
              <Tag className="w-4 h-4" />
              <span>MOTOR DE DESCUENTOS Y AFILIADOS</span>
            </div>
            <h2 className="text-3xl font-extrabold uppercase mb-4">
              APLICA TU CÓDIGO DE CREADOR O REFERIDO
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Soporte nativo para cupones promocionales, links de referidos y cálculo automático de comisiones para creadores.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ej: GOSU10 o ALEX_TCG"
              className="px-5 py-3.5 bg-surface-elevated border border-neutral-700 rounded-full text-sm font-mono focus:outline-none focus:border-accent-cyan uppercase text-white placeholder:text-neutral-600"
            />
            <button className="btn-pill bg-accent-cyan text-black font-extrabold hover:bg-white transition-colors">
              Aplicar Código
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
