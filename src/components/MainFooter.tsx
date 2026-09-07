"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Send, Loader2, CheckCircle2, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/(shop)/actions";

interface MainFooterProps {
  countryCode: string;
  currency: string;
}

export function MainFooter({ countryCode, currency }: MainFooterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage(null);

    const res = await subscribeNewsletterAction(email.trim());

    if (res.success) {
      setStatus("success");
      setEmail("");
      setMessage("¡Suscrito con éxito! Revisa tu bandeja de entrada.");
    } else {
      setStatus("error");
      setMessage(res.error || "Error al suscribir.");
    }
  };

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-white font-body pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Grid Principal del Footer (4 Columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Columna 1: Logo Oficial & Descripción de Marca (Columna 4/12) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gosu-logo-white.png"
                alt="GOSU® TCG GEAR"
                className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
              Accesorios TCG de calidad premium diseñados para jugadores competitivos. Protectores, deckboxes, binders y carpetas con máxima protección de grado torneo.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Envíos Activos a {countryCode} ({currency})</span>
            </div>
          </div>

          {/* Columna 2: Mapa del Sitio - Tienda & Catálogo (Columna 2/12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold text-accent-cyan uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs font-medium text-neutral-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/account/dashboard" className="hover:text-white transition-colors">
                  Mi Cuenta & Puntos
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Mis Pedidos
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-white transition-colors">
                  Carrito & Pago
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Mapa del Sitio - Legal & Soporte (Columna 2/12) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold text-accent-pink uppercase tracking-wider">
              Información & Legal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-neutral-400">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Política de Privacidad</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-accent-pink" />
                  <span>Términos del Servicio</span>
                </Link>
              </li>
              <li>
                <a href="mailto:soporte@gosu.com" className="hover:text-white transition-colors">
                  Soporte & Contacto
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-accent-cyan transition-colors font-mono text-[11px]">
                  Portal Admin ↗
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Suscripción a Newsletter Integrada en Pie de Página (Columna 4/12) */}
          <div className="lg:col-span-4 bg-neutral-900/60 p-6 rounded-2xl border border-neutral-800 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-[10px] font-mono font-bold">
              <Mail className="w-3 h-3" />
              <span>GOSU® CLUB NEWSLETTER</span>
            </div>

            <h4 className="text-sm font-extrabold uppercase tracking-tight text-white">
              Recibe Lanzamientos & Ofertas
            </h4>

            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Sé el primero en enterarte sobre reposición de stock, preventas y códigos de descuento secretos.
            </p>

            {status === "success" ? (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-2.5 px-4 transition-colors flex items-center justify-center gap-2 uppercase font-mono disabled:opacity-50"
                >
                  {status === "loading" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Unirme al Club</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {status === "error" && (
              <p className="text-[10px] text-rose-400 font-mono mt-1">{message}</p>
            )}
          </div>
        </div>

        {/* Franja Inferior (Bottom Bar) */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <p>© Gosu Accessories all rights reserved. Developed by MV Software</p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacidad
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Términos
            </Link>
            <span>•</span>
            <span className="text-neutral-600">Región: {countryCode}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
