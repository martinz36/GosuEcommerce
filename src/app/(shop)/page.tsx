import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Package, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { BundleSection } from "@/components/BundleSection";

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
    console.error("Error al consultar productos de Neon DB en la Home:", err);
  }

  // Si no hay productos en la base de datos, mostramos productos de demostración
  if (products.length === 0) {
    products = [
      {
        id: "demo-1",
        title: "GOSU® Armor Sleeves - Matte Black",
        priceUSD: 14.99,
        pricePEN: 56.00,
        basePrice: 14.99,
        compareAtPrice: 19.99,
        category: { name: "Sleeves" },
        images: [{ url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" }],
      },
      {
        id: "demo-2",
        title: "GOSU® Premium 9-Pocket Zip Binder",
        priceUSD: 34.99,
        pricePEN: 130.00,
        basePrice: 34.99,
        compareAtPrice: 42.99,
        category: { name: "Binders" },
        images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60" }],
      },
      {
        id: "demo-3",
        title: "GOSU® Magnetic Deck Box 100+",
        priceUSD: 24.99,
        pricePEN: 93.00,
        basePrice: 24.99,
        compareAtPrice: 29.99,
        category: { name: "Deck Boxes" },
        images: [{ url: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800&auto=format&fit=crop&q=60" }],
      },
    ];
  }

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section Banner */}
      <section className="relative overflow-hidden pt-16 pb-24 px-6 border-b border-surface-muted bg-gradient-to-b from-neutral-950 via-black to-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated border border-neutral-800 text-xs font-mono text-accent-cyan">
              <Sparkles className="w-3.5 h-3.5 text-accent-pink" />
              <span>NUEVA COLECCIÓN TCG GEAR 2026</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[1.1]">
              PROTECCIÓN <span className="bg-gradient-to-r from-accent-cyan to-accent-pink bg-clip-text text-transparent">PREMIUM</span> PARA TUS CARTAS
            </h1>

            <p className="text-neutral-400 text-sm sm:text-base max-w-lg leading-relaxed font-normal">
              Accesorios de grado competitivo para Magic: The Gathering, Yu-Gi-Oh!, Pokémon y Lorcana. Sleeves antideslizantes, Binders y Deck Boxes magnéticos.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalog"
                className="btn-pill bg-white text-black font-extrabold text-xs py-3.5 px-8 hover:bg-accent-cyan transition-colors flex items-center gap-2 shadow-lg shadow-white/10"
              >
                <span>VER CATÁLOGO</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#bundles"
                className="btn-pill bg-surface-elevated hover:bg-neutral-800 border border-neutral-700 text-white font-bold text-xs py-3.5 px-8 transition-colors"
              >
                PACKS PROMOCIONALES
              </a>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="w-full max-w-md aspect-square rounded-3xl bg-surface border border-neutral-800 p-4 shadow-2xl relative overflow-hidden group">
              <img
                src={products[0]?.images?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"}
                alt="GOSU Featured Product"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-8 left-8 right-8 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-accent-cyan uppercase tracking-widest block">DESTACADO</span>
                  <h3 className="font-bold text-xs text-white truncate max-w-[200px]">{products[0]?.title}</h3>
                </div>
                <span className="font-mono font-extrabold text-sm text-accent-pink">
                  {isPEN ? `S/. ${Number(products[0]?.pricePEN || Number(products[0]?.basePrice) * 3.75).toFixed(2)}` : `$${Number(products[0]?.priceUSD || products[0]?.basePrice).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección del Catálogo de Productos con Precios Duales Explícitos */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-surface-muted pb-6">
          <div>
            <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-1">
              PRODUCTOS DISPONIBLES EN NEON DB
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight uppercase">CATÁLOGO DE PRODUCTOS</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const displayPrice = isPEN
              ? Number(product.pricePEN || (Number(product.basePrice) * 3.75).toFixed(2))
              : Number(product.priceUSD || product.basePrice);

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={displayPrice}
                compareAtPrice={product.compareAtPrice ? Number(product.compareAtPrice) : null}
                imageUrl={product.images?.[0]?.url || null}
                categoryName={product.category?.name || "Accesorios TCG"}
              />
            );
          })}
        </div>
      </section>

      {/* Sección de Bundles & Packs */}
      <section id="bundles">
        <BundleSection />
      </section>
    </div>
  );
}
