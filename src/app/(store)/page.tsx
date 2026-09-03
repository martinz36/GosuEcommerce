"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Zap, ShieldCheck, Sparkles, Tag, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { hoverScaleProps, staggerContainerVariants, cardFadeUpVariants } from "@/lib/motion";

export default function StoreHomePage() {
  const featuredProducts = [
    {
      id: "prod-1",
      title: "GOSU® Armor Sleeves - Japanese Size (Matte Black)",
      price: "$14.99",
      compareAt: "$19.99",
      badge: "BESTSELLER",
      badgeColor: "bg-accent-cyan text-black",
      category: "Sleeves",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: "bundle-1",
      title: "PRO Collector Bundle (3x Sleeves + 1x Binder + Deck Box)",
      price: "$49.99",
      compareAt: "$69.99",
      badge: "PACK / BUNDLE -28%",
      badgeColor: "bg-accent-pink text-white font-bold",
      category: "Bundles",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
    },
    {
      id: "prod-2",
      title: "GOSU® Toploader Binder (9-Pocket Zip Armor)",
      price: "$34.99",
      compareAt: null,
      badge: "AFFILIATE SPECIAL",
      badgeColor: "bg-accent-yellow text-black",
      category: "Binders",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-accent-cyan selection:text-black">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-surface-muted">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-accent-cyan to-accent-pink bg-clip-text text-transparent">
              GOSU®
            </span>
            <span className="text-xs bg-surface-elevated border border-neutral-700 px-2 py-0.5 rounded-full text-accent-cyan font-mono">
              ENGINE v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#catalog" className="hover:text-accent-cyan transition-colors">Catálogo</a>
            <a href="#bundles" className="hover:text-accent-pink transition-colors">Packs & Bundles</a>
            <a href="#affiliates" className="hover:text-accent-yellow transition-colors">Programa Afiliados</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-elevated hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-accent-cyan" />
              <span>Panel Admin</span>
            </Link>

            <motion.button
              {...hoverScaleProps}
              className="relative p-2.5 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-accent-cyan" />
              <span className="absolute -top-1 -right-1 bg-accent-pink text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-6 border-b border-surface-muted">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-cyan/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-elevated border border-neutral-800 text-xs font-mono text-accent-cyan mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent-pink" />
            <span>SISTEMA DE E-COMMERCE CON MOTOR TIPO SHOPIFY</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase leading-none mb-6"
          >
            EQUIPAMIENTO <span className="text-accent-cyan">PREMIUM</span> PARA COLECCIONISTAS TCG
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10"
          >
            Protección de nivel competitivo, bundles promocionales, códigos de afiliado y pagos seguros alimentados por Next.js y Neon Postgres.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <motion.a
              href="#catalog"
              {...hoverScaleProps}
              className="btn-pill bg-white text-black font-bold border border-white hover:bg-accent-cyan hover:border-accent-cyan transition-colors"
            >
              Explorar Productos
            </motion.a>
            <Link
              href="/dashboard/products/new"
              className="btn-pill glass-panel text-white font-medium border border-neutral-700 hover:border-accent-pink transition-colors"
            >
              + Crear Producto (Admin)
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-12 px-6 bg-surface border-b border-surface-muted">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-black rounded-card border border-neutral-800 flex items-start gap-4">
            <div className="p-3 bg-accent-cyan/10 rounded-lg text-accent-cyan">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Packs & Bundles Dinámicos</h3>
              <p className="text-xs text-neutral-400">Agrupa productos con precios promocionales y stock sincronizado automáticamente.</p>
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

      {/* Product Catalog Grid Section */}
      <section id="catalog" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-extrabold uppercase tracking-tight">PRODUCTOS DESTACADOS</h2>
            <p className="text-neutral-400 text-sm mt-1">Diseño de tarjetas de producto con tokens extraídos del Design System de Framer</p>
          </div>
        </div>

        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={cardFadeUpVariants}
              whileHover={{ y: -6 }}
              className="group bg-surface rounded-card border border-neutral-800 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-neutral-600 hover:shadow-card"
            >
              <div>
                <div className="relative aspect-square overflow-hidden bg-neutral-950">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${product.badgeColor}`}>
                      {product.badge}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-2">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-lg leading-snug group-hover:text-accent-cyan transition-colors">
                    {product.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center justify-between">
                <div>
                  <span className="text-xl font-black text-white">{product.price}</span>
                  {product.compareAt && (
                    <span className="text-sm text-neutral-500 line-through ml-2 font-mono">
                      {product.compareAt}
                    </span>
                  )}
                </div>

                <motion.button
                  {...hoverScaleProps}
                  className="btn-pill bg-white text-black font-bold hover:bg-accent-cyan transition-colors"
                >
                  Agregar
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-surface-muted text-center text-xs text-neutral-500">
        <p>© 2026 GOSU® E-Commerce Engine. Impulsado por Next.js App Router, Neon Postgres & Stripe.</p>
      </footer>
    </div>
  );
}
