"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, Image as ImageIcon, Sparkles, AlertTriangle } from "lucide-react";
import { useStoreSettings } from "@/providers/StoreProvider";

interface SearchResult {
  id: string;
  title: string;
  sku: string;
  priceUSD: number;
  pricePEN: number;
  stock: number;
  categoryName: string;
  imageUrl?: string | null;
  isFamily: boolean;
}

export function HeaderSearch() {
  const { currency, currencySymbol } = useStoreSettings();
  const isPEN = currency === "PEN";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Error al buscar productos:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-md font-body">
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar productos, mazos, fundas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setIsOpen(true)}
          className="w-full pl-9 pr-8 py-2 bg-neutral-900 border border-neutral-800 rounded-full text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan transition-all"
        />
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 text-accent-cyan animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {/* Dropdown Flotante con Autocompletado Predictivo */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden z-50 divide-y divide-neutral-800/80 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 bg-neutral-950/80 flex items-center justify-between text-[11px] font-mono text-neutral-400">
            <span>RESULTADOS DE BÚSQUEDA</span>
            <span className="text-accent-cyan font-bold">{results.length} sugerencias</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {results.map((product) => {
              const displayPrice = isPEN ? product.pricePEN : product.priceUSD;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className="p-3 flex items-center gap-3 hover:bg-neutral-800/60 transition-colors group block"
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-10 rounded-lg bg-black border border-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-neutral-600" />
                    )}
                  </div>

                  {/* Detalle Producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-accent-cyan truncate transition-colors leading-tight">
                      {product.title}
                    </h4>
                    <span className="text-[11px] text-neutral-400 font-mono block">
                      SKU: {product.sku} • {product.categoryName}
                    </span>
                  </div>

                  {/* Precio & Badge de Escasez */}
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-accent-cyan block">
                      {currencySymbol}{displayPrice.toFixed(2)}
                    </span>
                    {product.stock <= 3 && product.stock > 0 ? (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Últimas {product.stock} un.
                      </span>
                    ) : product.stock <= 0 ? (
                      <span className="text-[10px] text-rose-500 font-bold">Agotado</span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
