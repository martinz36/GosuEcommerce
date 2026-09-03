import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Layers
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

  // 1. Leer cookies de geolocalización y preferencia de moneda
  const cookieStore = cookies();
  const userCountry = cookieStore.get("user-country")?.value || "PE";
  const userCurrencyPref = cookieStore.get("user-currency")?.value;

  let currencySymbol = userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref) ? "S/." : "$";
  let exchangeRate = userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref) ? 3.75 : 1.00;

  // Consultar Neon DB para obtener la tasa de cambio exacta de la región
  try {
    if (process.env.DATABASE_URL) {
      const region = await prisma.regionConfig.findUnique({
        where: { countryCode: userCountry },
      });
      if (region && region.isActive && !userCurrencyPref) {
        currencySymbol = region.currencySymbol;
        exchangeRate = Number(region.exchangeRate);
      }
    }
  } catch (err) {
    console.error("Error al consultar RegionConfig en PDP:", err);
  }

  // 2. Fetch del producto desde Neon Postgres vía Prisma ORM
  let product: any = null;
  let familyVariants: any[] = [];
  let relatedProducts: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      product = await prisma.product.findFirst({
        where: {
          OR: [{ id: id }, { slug: id }, { uniqueId: id }, { sku: id }],
        },
        include: {
          images: true,
          category: true,
          variants: true,
        },
      });

      if (product) {
        if (product.familyId) {
          familyVariants = await prisma.product.findMany({
            where: {
              familyId: product.familyId,
              isActive: true,
            },
            include: {
              images: true,
            },
            orderBy: { title: "asc" },
          });
        }

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

  // Respaldo para productos de demostración estáticos
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
        isFamily: true,
        familyId: "FAM-SLEEVES-MATTE",
        category: { name: "Sleeves" },
        images: [{ url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" }],
      },
    };

    product = mockCatalog[id] || null;
  }

  if (!product) {
    notFound();
  }

  const mainImage = product.images?.[0]?.url || null;
  const rawBasePriceUSD = Number(product.basePrice);
  const rawCompareAtUSD = product.compareAtPrice ? Number(product.compareAtPrice) : null;

  // Formatear precio para la moneda activa de la región (S/. o $)
  const displayPrice = `${currencySymbol}${(rawBasePriceUSD * exchangeRate).toFixed(2)}`;
  const displayCompareAt = rawCompareAtUSD ? `${currencySymbol}${(rawCompareAtUSD * exchangeRate).toFixed(2)}` : null;

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

      {/* Layout de 2 Columnas en Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Columna Izquierda: Imagen Gigante de Cloudinary */}
        <div className="bg-surface rounded-2xl border border-neutral-800 overflow-hidden relative aspect-square flex items-center justify-center group shadow-2xl">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-600">
              <ImageIcon className="w-16 h-16 stroke-[1]" />
              <span className="text-xs font-mono uppercase tracking-widest">Sin Imagen Asignada</span>
            </div>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3.5 py-1.5 text-xs font-mono font-extrabold rounded-full bg-accent-cyan text-black uppercase tracking-wider shadow-lg">
              {product.category?.name || "Accesorios TCG"}
            </span>
            {product.isFamily && (
              <span className="px-3.5 py-1.5 text-xs font-mono font-extrabold rounded-full bg-accent-pink text-white uppercase tracking-wider shadow-lg flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> COLECCIÓN
              </span>
            )}
          </div>
        </div>

        {/* Columna Derecha: Ficha Técnica, Precio Multi-Moneda y Botón Zustand */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-2">
              SKU: {product.sku} {product.familyId ? `| FAMILIA: ${product.familyId}` : ""}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight mb-4">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-white font-mono">{displayPrice}</span>
              {displayCompareAt && (
                <span className="text-lg text-neutral-500 line-through font-mono">
                  {displayCompareAt}
                </span>
              )}
            </div>
          </div>

          {/* Selector de Variantes de Color / Familia */}
          {familyVariants.length > 1 && (
            <div className="p-4 bg-surface-elevated rounded-xl border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-300">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-accent-cyan">
                  <Layers className="w-4 h-4 text-accent-pink" /> Variantes de Color / Familia:
                </span>
                <span className="text-neutral-500">{familyVariants.length} opciones disponibles</span>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                {familyVariants.map((variant) => {
                  const isCurrent = variant.id === product.id;
                  const variantImg = variant.images?.[0]?.url || mainImage;
                  return (
                    <Link
                      key={variant.id}
                      href={`/products/${variant.id}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
                        isCurrent
                          ? "bg-white text-black font-bold border-white shadow-md scale-105"
                          : "bg-black text-neutral-300 border-neutral-800 hover:border-neutral-600 hover:text-white"
                      }`}
                    >
                      <div className="w-6 h-6 rounded overflow-hidden bg-neutral-900 border border-neutral-700 shrink-0">
                        {variantImg ? (
                          <img src={variantImg} alt={variant.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-800" />
                        )}
                      </div>
                      <span className="truncate max-w-[140px]">{variant.title.replace(product.title.split("(")[0], "").trim() || variant.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

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

          {/* Componente Cliente del Botón de Agregar al Carrito (Pasa el precio base USD) */}
          <div className="space-y-4 pt-2">
            <AddToCartButton
              productId={product.id}
              productTitle={product.title}
              price={rawBasePriceUSD}
              imageUrl={mainImage}
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
