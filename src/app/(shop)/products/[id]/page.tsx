import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Image as ImageIcon,
  CheckCircle2
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";

export const revalidate = 0;

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = params;

  // 1. Fetch del producto desde Neon Postgres vía Prisma ORM
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      product = await prisma.product.findFirst({
        where: {
          OR: [{ id: id }, { slug: id }],
        },
        include: {
          images: true,
          category: true,
          variants: true,
        },
      });

      if (product) {
        relatedProducts = await prisma.product.findMany({
          where: {
            id: { not: product.id },
            isActive: true,
          },
          include: {
            images: true,
            category: true,
          },
          take: 3,
        });
      }
    }
  } catch (err) {
    console.error("Error buscando detalle del producto en Neon DB:", err);
  }

  // 2. Respaldo para productos de demostración estáticos si se consulta por demo-id
  if (!product && id.startsWith("demo-")) {
    const mockCatalog: Record<string, any> = {
      "demo-1": {
        id: "demo-1",
        title: "GOSU® Armor Sleeves - Japanese Size (Matte Black)",
        description: "Fundas protectoras de nivel profesional para juegos TCG (Yu-Gi-Oh!, Cardfight!! Vanguard). Textura Matte antideslizante en la parte trasera y frente ultra transparente libre de PVC y ácido para máxima durabilidad en torneos.",
        basePrice: "14.99",
        compareAtPrice: "19.99",
        stock: 50,
        sku: "GOSU-SLV-001",
        category: { name: "Sleeves" },
        images: [{ url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" }],
      },
      "demo-2": {
        id: "demo-2",
        title: "PRO Collector Bundle (3x Sleeves + 1x Binder + Deck Box)",
        description: "Pack especial promocional que incluye 3 paquetes de fundas Armor Matte, 1 carpeta Zip Armor de 9 bolsillos y 1 Deck Box magnética con capacidad para 100+ cartas con doble funda.",
        basePrice: "49.99",
        compareAtPrice: "69.99",
        stock: 20,
        sku: "GOSU-BDL-001",
        category: { name: "Bundles" },
        images: [{ url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60" }],
      },
      "demo-3": {
        id: "demo-3",
        title: "GOSU® Toploader Binder (9-Pocket Zip Armor)",
        description: "Carpetas de almacenamiento con cremallera acolchada de alta resistencia. Diseñada especialmente para almacenar cartas dentro de toploaders rígidos sin doblar las esquinas.",
        basePrice: "34.99",
        compareAtPrice: null,
        stock: 15,
        sku: "GOSU-BND-001",
        category: { name: "Binders" },
        images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60" }],
      },
    };

    product = mockCatalog[id] || null;
  }

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.[0]?.url || null;
  const formattedPrice = `$${Number(product.basePrice).toFixed(2)}`;
  const formattedCompareAt = product.compareAtPrice ? `$${Number(product.compareAtPrice).toFixed(2)}` : null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Botón de Regreso */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-accent-cyan transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Catálogo</span>
      </Link>

      {/* Grid Principal de Producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Imagen del Producto */}
        <div className="bg-surface rounded-card border border-neutral-800 overflow-hidden relative aspect-square flex items-center justify-center">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-600">
              <ImageIcon className="w-16 h-16 stroke-[1]" />
              <span className="text-xs font-mono uppercase tracking-widest">Sin Imagen Asignada</span>
            </div>
          )}

          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-accent-cyan text-black uppercase tracking-wider">
              {product.category?.name || "Accesorios TCG"}
            </span>
          </div>
        </div>

        {/* Ficha Técnica e Información */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-2">
              SKU: {product.sku}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight mb-4">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white">{formattedPrice}</span>
              {formattedCompareAt && (
                <span className="text-lg text-neutral-500 line-through font-mono">
                  {formattedCompareAt}
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-b border-surface-muted py-6">
            <h3 className="text-xs font-mono uppercase text-neutral-400 mb-2">Descripción del Producto</h3>
            <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Estado de Inventario */}
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>En Stock ({product.stock} unidades disponibles en inventario)</span>
          </div>

          {/* Componente Cliente del Botón de Agregar al Carrito */}
          <div className="space-y-4 pt-2">
            <AddToCartButton
              productId={product.id}
              productTitle={product.title}
              price={formattedPrice}
            />

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-neutral-400 border-t border-surface-muted">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-cyan" />
                <span>Envío express asegurado</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-pink" />
                <span>Garantía de protección TCG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productos Relacionados */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-surface-muted space-y-8">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">TAMBIÉN TE PUEDE INTERESAR</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((rel) => (
              <ProductCard
                key={rel.id}
                id={rel.id}
                title={rel.title}
                price={Number(rel.basePrice)}
                compareAtPrice={rel.compareAtPrice ? Number(rel.compareAtPrice) : null}
                imageUrl={rel.images[0]?.url || null}
                categoryName={rel.category?.name || "Accesorios TCG"}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
