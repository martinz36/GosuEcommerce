"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown, Loader2, CheckCircle2 } from "lucide-react";

interface LoadMoreButtonProps {
  currentPage: number;
  displayedCount: number;
  totalCount: number;
}

export function LoadMoreButton({ currentPage, displayedCount, totalCount }: LoadMoreButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const hasMore = displayedCount < totalCount;

  const handleLoadMore = () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    const nextPage = currentPage + 1;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", nextPage.toString());

    router.push(`${pathname}?${params.toString()}`, { scroll: false });

    // Restablecer el estado de carga tras la navegación
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center justify-center pt-10 pb-6 space-y-4 font-body">
      {/* Indicador de progreso de productos vistos */}
      <div className="text-center space-y-1.5">
        <p className="text-xs font-mono text-neutral-400">
          Mostrando <span className="text-white font-bold">{displayedCount}</span> de{" "}
          <span className="text-white font-bold">{totalCount}</span> productos
        </p>
        <div className="w-48 sm:w-64 h-1.5 bg-neutral-900 rounded-full overflow-hidden mx-auto border border-neutral-800">
          <div
            className="h-full bg-gradient-to-r from-accent-cyan to-accent-pink transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, (displayedCount / Math.max(1, totalCount)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Botón o Texto de Término */}
      {hasMore ? (
        <button
          onClick={handleLoadMore}
          disabled={isLoading}
          className="btn-pill bg-surface-elevated hover:bg-neutral-800 border border-neutral-700 text-white hover:border-accent-cyan hover:text-accent-cyan font-mono font-extrabold text-xs py-3.5 px-8 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 uppercase tracking-wider group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent-cyan" />
              <span>Cargando más...</span>
            </>
          ) : (
            <>
              <span>Cargar más productos</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </>
          )}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 pt-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Has visto todos los productos</span>
        </div>
      )}
    </div>
  );
}
