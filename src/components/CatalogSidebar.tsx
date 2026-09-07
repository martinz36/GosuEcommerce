"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X, ChevronDown, Check, SlidersHorizontal, RotateCcw } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface CatalogSidebarProps {
  categories: CategoryOption[];
  totalCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

// Colores visuales predefinidos con Hexadecimales y nombres en español/inglés
const COLOR_OPTIONS = [
  { name: "Negro", value: "Black", hex: "#18181B", border: "border-neutral-700" },
  { name: "Rojo", value: "Red", hex: "#EF4444", border: "border-red-500" },
  { name: "Azul", value: "Blue", hex: "#3B82F6", border: "border-blue-500" },
  { name: "Morado", value: "Purple", hex: "#8B5CF6", border: "border-purple-500" },
  { name: "Blanco", value: "White", hex: "#FFFFFF", border: "border-neutral-300" },
  { name: "Verde", value: "Green", hex: "#10B981", border: "border-emerald-500" },
  { name: "Dorado", value: "Gold", hex: "#EAB308", border: "border-amber-500" },
];

export function CatalogSidebar({ categories, totalCount, isMobileOpen, onCloseMobile }: CatalogSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Leer estado inicial desde la URL
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentColor = searchParams.get("color") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // Estados locales para inputs interactivos
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [isCategoryAccordionOpen, setIsCategoryAccordionOpen] = useState(true);

  // Sincronizar estados locales cuando la URL cambia externamente
  useEffect(() => {
    setSearchTerm(currentSearch);
    setMinPriceInput(currentMinPrice);
    setMaxPriceInput(currentMaxPrice);
  }, [currentSearch, currentMinPrice, currentMaxPrice]);

  // Función helper para actualizar parámetros de la URL y RESETEAR SIEMPRE A PAGE 1
  const updateQueryParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Regla de Negocio Paso 2: Cualquier cambio en filtros resetea la paginación a page=1
    params.set("page", "1");

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  // Manejador de búsqueda por nombre
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({ search: searchTerm.trim() || null });
  };

  // Manejador de selección de categoría
  const handleCategoryToggle = (slug: string) => {
    const categoriesArray = currentCategory ? currentCategory.split(",") : [];
    let updated: string[];

    if (categoriesArray.includes(slug)) {
      updated = categoriesArray.filter((c) => c !== slug);
    } else {
      updated = [...categoriesArray, slug];
    }

    updateQueryParams({ category: updated.length > 0 ? updated.join(",") : null });
  };

  // Manejador de selección de color visual
  const handleColorToggle = (colorValue: string) => {
    if (currentColor.toLowerCase() === colorValue.toLowerCase()) {
      updateQueryParams({ color: null });
    } else {
      updateQueryParams({ color: colorValue });
    }
  };

  // Manejador de rango de precio
  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateQueryParams({
      minPrice: minPriceInput.trim() || null,
      maxPrice: maxPriceInput.trim() || null,
    });
  };

  // Limpiar todos los filtros
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname);
  };

  // Verificar si hay algún filtro activo
  const hasActiveFilters = Boolean(
    currentSearch || currentCategory || currentColor || currentMinPrice || currentMaxPrice
  );

  const activeCategoriesArray = currentCategory ? currentCategory.split(",") : [];

  const SidebarContent = (
    <div className="space-y-6 text-white font-body">
      {/* Cabecera del Sidebar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-accent-cyan" />
          <h3 className="font-mono font-extrabold text-sm uppercase tracking-wider">Filtros & Búsqueda</h3>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearAllFilters}
            className="text-[11px] font-mono text-accent-pink hover:text-white flex items-center gap-1 transition-colors"
            title="Limpiar filtros"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* 1. Búsqueda por Nombre (Search Input) */}
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <label className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
          Buscar Producto
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ej. Armor Sleeves, Binder..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2.5 pl-3.5 pr-9 text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan transition-colors"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                updateQueryParams({ search: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-accent-cyan">
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* 2. Filtro de Categorías (Checkboxes en Accordion) */}
      <div className="border-t border-neutral-900 pt-4 space-y-3">
        <button
          type="button"
          onClick={() => setIsCategoryAccordionOpen(!isCategoryAccordionOpen)}
          className="w-full flex items-center justify-between text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider hover:text-accent-cyan transition-colors"
        >
          <span>Categorías</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryAccordionOpen ? "rotate-180" : ""}`} />
        </button>

        {isCategoryAccordionOpen && (
          <div className="space-y-2 pl-1 pt-1">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const isSelected = activeCategoriesArray.includes(cat.slug);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2.5 text-xs text-neutral-400 hover:text-white cursor-pointer select-none py-1 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-accent-cyan border-accent-cyan text-black"
                          : "bg-neutral-900 border-neutral-700"
                      }`}
                      onClick={() => handleCategoryToggle(cat.slug)}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span onClick={() => handleCategoryToggle(cat.slug)} className={isSelected ? "text-white font-semibold" : ""}>
                      {cat.name}
                    </span>
                  </label>
                );
              })
            ) : (
              // Categorías por defecto si no existen en BD
              [
                { name: "Sleeves", slug: "sleeves" },
                { name: "Deck Boxes", slug: "deck-boxes" },
                { name: "Binders", slug: "binders" },
                { name: "Playmats", slug: "playmats" },
                { name: "Accesorios", slug: "accesorios" },
              ].map((cat) => {
                const isSelected = activeCategoriesArray.includes(cat.slug);
                return (
                  <label
                    key={cat.slug}
                    className="flex items-center gap-2.5 text-xs text-neutral-400 hover:text-white cursor-pointer select-none py-1 transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-accent-cyan border-accent-cyan text-black"
                          : "bg-neutral-900 border-neutral-700"
                      }`}
                      onClick={() => handleCategoryToggle(cat.slug)}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span onClick={() => handleCategoryToggle(cat.slug)} className={isSelected ? "text-white font-semibold" : ""}>
                      {cat.name}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 3. Filtro por Color (Visual Circles) */}
      <div className="border-t border-neutral-900 pt-4 space-y-3">
        <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
          Color
        </label>
        <div className="flex flex-wrap gap-2.5 pt-1">
          {COLOR_OPTIONS.map((c) => {
            const isSelected = currentColor.toLowerCase() === c.value.toLowerCase();
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => handleColorToggle(c.value)}
                title={`${c.name} (${c.value})`}
                className={`group relative w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-accent-cyan ring-offset-2 ring-offset-black scale-110"
                    : "hover:ring-2 hover:ring-neutral-500 hover:ring-offset-2 hover:ring-offset-black hover:scale-105"
                }`}
                style={{ backgroundColor: c.hex }}
              >
                <span className={`absolute inset-0 rounded-full border ${c.border} pointer-events-none`} />
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 stroke-[3] ${
                      c.value === "White" ? "text-black" : "text-white"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Filtro de Precio (Rango Min y Max) */}
      <form onSubmit={handlePriceApply} className="border-t border-neutral-900 pt-4 space-y-3">
        <label className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider block">
          Rango de Precio
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            placeholder="Mín."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            placeholder="Máx."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs py-2 rounded-xl transition-colors font-bold uppercase"
        >
          Aplicar Precio
        </button>
      </form>

      {/* Badges de Filtros Activos */}
      {hasActiveFilters && (
        <div className="border-t border-neutral-900 pt-4 space-y-2">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">
            Filtros Aplicados:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[11px] font-mono">
                "{currentSearch}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSearchTerm("");
                    updateQueryParams({ search: null });
                  }}
                />
              </span>
            )}

            {activeCategoriesArray.map((catSlug) => (
              <span
                key={catSlug}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-[11px] font-mono uppercase"
              >
                {catSlug}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => handleCategoryToggle(catSlug)}
                />
              </span>
            ))}

            {currentColor && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
                Color: {currentColor}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => updateQueryParams({ color: null })}
                />
              </span>
            )}

            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-mono">
                ${currentMinPrice || "0"} - ${currentMaxPrice || "∞"}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-white"
                  onClick={() => {
                    setMinPriceInput("");
                    setMaxPriceInput("");
                    updateQueryParams({ minPrice: null, maxPrice: null });
                  }}
                />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Sidebar para Pantallas de Escritorio (Desktop 1/4) */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 bg-neutral-950 p-6 rounded-2xl border border-neutral-800 self-start sticky top-24">
        {SidebarContent}
      </aside>

      {/* Drawer Slide-Over para Móviles */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto w-full max-w-xs bg-neutral-950 border-l border-neutral-800 p-6 overflow-y-auto h-full shadow-2xl z-10">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-800">
              <span className="font-mono font-bold text-xs uppercase text-accent-cyan">Panel de Filtros</span>
              <button
                onClick={onCloseMobile}
                className="p-1 text-neutral-400 hover:text-white rounded-lg bg-neutral-900 border border-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
