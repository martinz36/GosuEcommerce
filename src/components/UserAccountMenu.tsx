"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { User, LayoutDashboard, ShoppingBag, Award, LogOut, ChevronDown, ShieldCheck } from "lucide-react";

export function UserAccountMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
    );
  }

  if (!session || !session.user) {
    return (
      <Link
        href="/account/login"
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors text-xs font-semibold text-white"
        title="Iniciar Sesión"
      >
        <User className="w-4 h-4 text-accent-pink" />
        <span className="hidden sm:inline">Cuenta</span>
      </Link>
    );
  }

  const userRole = (session.user as any).role || "USER";
  const isAdmin = userRole === "ADMIN";
  const userName = session.user.name?.split(" ")[0] || "Cuenta";

  return (
    <div ref={dropdownRef} className="relative font-body">
      {/* Botón de Cuenta con Avatar / Icono */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pl-2.5 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors text-xs font-semibold text-white focus:outline-none"
      >
        <User className="w-4 h-4 text-accent-pink" />
        <span className="max-w-[100px] truncate">{userName}</span>
        {isAdmin && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold bg-accent-cyan text-black uppercase">
            ADMIN
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Menú Desplegable (Dropdown Privado) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden z-50 divide-y divide-neutral-800/80 animate-in fade-in slide-in-from-top-2">
          
          {/* Cabecera del Usuario */}
          <div className="p-3.5 bg-black/60">
            <p className="text-xs font-bold text-white truncate">{session.user.name}</p>
            <p className="text-[11px] text-neutral-400 font-mono truncate">{session.user.email}</p>
          </div>

          {/* Enlaces de Navegación del Usuario */}
          <div className="p-1.5 space-y-0.5 text-xs font-medium">
            <Link
              href="/account/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <Award className="w-4 h-4 text-accent-yellow" />
              <span>Mi Cuenta & Puntos</span>
            </Link>

            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-accent-cyan" />
              <span>Mis Pedidos</span>
            </Link>

            <Link
              href="/account/affiliate"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-accent-pink" />
              <span>Portal de Afiliados</span>
            </Link>
          </div>

          {/* PASO 3: Renderizado Condicional del Enlace al Portal Administrativo solo para ROL ADMIN */}
          {isAdmin && (
            <div className="p-1.5">
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-accent-cyan font-bold bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-accent-cyan" />
                <span>Portal Administrativo</span>
              </Link>
            </div>
          )}

          {/* Cerrar Sesión */}
          <div className="p-1.5">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-xs font-semibold"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
