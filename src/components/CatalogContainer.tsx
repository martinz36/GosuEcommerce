"use client";

import React, { useState } from "react";
import { SlidersHorizontal, PackageX } from "lucide-react";
import { CatalogSidebar } from "./CatalogSidebar";
import { ProductCard } from "./ProductCard";
import { LoadMoreButton } from "./LoadMoreButton";

interface CatalogContainerProps {
  products: any[];
  categories: { id: string; name: string; slug: string }[];
  totalCount: number;
  currentPage: number;
}

export function CatalogContainer({
  products,
  categories,
  totalCount,
  currentPage,
}: CatalogContainerProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 font-body space-y-8">
      {/* Banner de Cabecera del Catálogo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-1">
            EXPLORA NUESTRA COLECCIÓN TCG GEAR
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
            CATÁLOGO DE PRODUCTOS
          </h1>
        </div>

        {/* Botón de Filtros para Móviles (Visible solo en < lg) */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-neutral-700 text-xs font-mono font-bold text-white hover:border-accent-cyan transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-accent-cyan" />
          <span>FILTROS & BÚSQUEDA</span>
        </button>
      </div>

      {/* Grid Principal: 1/4 Sidebar (Desktop) + 3/4 Productos */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Interactivo (1/4 en desktop) */}
        <CatalogSidebar
          categories={categories}
          totalCount={totalCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Vitrina de Productos (3/4 en desktop: grid-cols-3) */}
        <main className="flex-1 space-y-8">
          {products.length > 0 ? (
            <>
              {/* Cuadrícula de Productos de 3 Columnas en Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      title: product.title,
                      description: product.description,
                      priceUSD: Number(product.priceUSD || product.basePrice || 0),
                      pricePEN: Number(product.pricePEN || (Number(product.basePrice || 0) * 3.75).toFixed(2)),
                      stock: product.stock,
                      imageUrl: product.images?.[0]?.url || product.imageUrl || null,
                      secondaryImageUrl: product.images?.[1]?.url || product.secondaryImageUrl || null,
                      images: product.images,
                      isFamily: product.isFamily,
                      familyId: product.familyId,
                      categoryName: product.category?.name || "Accesorios TCG",
                    }}
                  />
                ))}
              </div>

              {/* Botón 'Cargar Más' de Paginación */}
              <LoadMoreButton
                currentPage={currentPage}
                displayedCount={products.length}
                totalCount={totalCount}
              />
            </>
          ) : (
            /* Estado Vacío cuando no coinciden los filtros */
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <PackageX className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  No se encontraron productos
                </h3>
                <p className="text-xs text-neutral-400">
                  Intenta cambiar o limpiar los filtros seleccionados para ver más resultados.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
