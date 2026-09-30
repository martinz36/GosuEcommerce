"use client";

import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { HeaderSearch } from "./HeaderSearch";
import { UserAccountMenu } from "./UserAccountMenu";
import { CartButton } from "./CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-800 shadow-lg shadow-cyan-950/20 font-body">
      
      {/* Paso 1: Announcement Bar (Banner Superior Llamativo con Colores de Marca) */}
      <div className="bg-gradient-to-r from-accent-cyan/90 via-purple-600 to-accent-pink/90 text-white border-b border-neutral-800/40 text-xs font-mono py-2 px-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Espaciador Izquierdo para equilibrar el centro */}
          <div className="hidden sm:block w-28" />

          {/* Centro: Texto Promocional Destacado */}
          <div className="flex-1 text-center font-bold tracking-wide uppercase truncate flex items-center justify-center gap-2 drop-shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse shrink-0" />
            <span>Envíos gratis en compras sobre S/. 150</span>
          </div>

          {/* Derecha: Selectores de Idioma y Moneda */}
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher variant="clean" />
            <span className="text-white/40 font-bold">|</span>
            <CurrencySwitcher variant="clean" />
          </div>
        </div>
      </div>

      {/* Paso 2 & 3: Main Header (Barra Principal) con Glassmorphism y Tipografía Mejorada */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between relative">
        
        {/* Izquierda: Logo GOSU */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gosu-logo-white.png"
            alt="GOSU® TCG GEAR"
            className="h-8 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Centro Absoluto: Enlaces de Navegación con Mayor Tamaño, Peso y Línea Hover */}
        <nav className="hidden md:flex items-center gap-8 text-sm sm:text-base font-semibold text-neutral-200 absolute left-1/2 -translate-x-1/2">
          <a
            href="https://gosuaccessories.com/about-us/es"
            target="_blank"
            rel="noopener noreferrer"
            className="relative py-1 hover:text-accent-cyan transition-colors duration-200 group"
          >
            <span>Nosotros</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-cyan scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left shadow-[0_0_8px_#00E8FF]" />
          </a>
          <Link
            href="/catalog"
            className="relative py-1 text-accent-cyan font-bold hover:text-white transition-colors duration-200 group"
          >
            <span>Tienda</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-cyan scale-x-100 transition-transform duration-200 origin-left shadow-[0_0_8px_#00E8FF]" />
          </Link>
          <a
            href="https://gosuaccessories.com/stores/es"
            target="_blank"
            rel="noopener noreferrer"
            className="relative py-1 hover:text-accent-cyan transition-colors duration-200 group"
          >
            <span>Tiendas</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-cyan scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left shadow-[0_0_8px_#00E8FF]" />
          </a>
          <a
            href="https://gosuaccessories.com/become-partner/es"
            target="_blank"
            rel="noopener noreferrer"
            className="relative py-1 hover:text-accent-cyan transition-colors duration-200 group"
          >
            <span>Vuélvete partner</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-cyan scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left shadow-[0_0_8px_#00E8FF]" />
          </a>
        </nav>

        {/* Derecha: Íconos del Menú */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <HeaderSearch variant="icon" />
          <UserAccountMenu variant="icon" />
          <CartButton variant="icon" />
        </div>
      </div>
    </header>
  );
}
