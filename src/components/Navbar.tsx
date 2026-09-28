"use client";

import React from "react";
import Link from "next/link";
import { HeaderSearch } from "./HeaderSearch";
import { UserAccountMenu } from "./UserAccountMenu";
import { CartButton } from "./CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CurrencySwitcher } from "./CurrencySwitcher";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-neutral-800/80 font-body">
      
      {/* Paso 1: Announcement Bar (Barra Superior Estrecha h-9) */}
      <div className="bg-neutral-950/90 border-b border-neutral-800/60 text-[11px] font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-9 flex items-center justify-between">
          
          {/* Espaciador Izquierdo para centrar perfectamente el aviso */}
          <div className="hidden sm:block w-28" />

          {/* Centro: Texto Promocional */}
          <div className="flex-1 text-center font-semibold text-neutral-300 tracking-wide truncate">
            <span>Envíos gratis en compras sobre S/. 150</span>
          </div>

          {/* Derecha: Selectores Limpios de Idioma y Moneda con ChevronDown */}
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher variant="clean" />
            <span className="text-neutral-700">|</span>
            <CurrencySwitcher variant="clean" />
          </div>
        </div>
      </div>

      {/* Paso 2: Main Header (Barra Principal) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between relative">
        
        {/* Izquierda: Logo GOSU */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gosu-logo-white.png"
            alt="GOSU® TCG GEAR"
            className="h-7 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Centro Absoluto: Enlaces de Navegación Centrados en Pantalla */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-neutral-300 absolute left-1/2 -translate-x-1/2">
          <a
            href="https://gosuaccessories.com/about-us/es"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Nosotros
          </a>
          <Link
            href="/catalog"
            className="text-accent-cyan font-bold hover:text-white transition-colors"
          >
            Tienda
          </Link>
          <a
            href="https://gosuaccessories.com/stores/es"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Tiendas
          </a>
          <a
            href="https://gosuaccessories.com/become-partner/es"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            Vuélvete partner
          </a>
        </nav>

        {/* Derecha: 3 Íconos Minimalistas con Fondo Transparente (Lupa, Usuario, Bolsa) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* 1. Lupa (Buscador) */}
          <HeaderSearch variant="icon" />

          {/* 2. Usuario (Cuenta/Login con Dropdown Privado) */}
          <UserAccountMenu variant="icon" />

          {/* 3. Bolsa (Carrito de Compras) */}
          <CartButton variant="icon" />
        </div>
      </div>
    </header>
  );
}
