"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, LogIn, UserPlus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { signIn } from "next-auth/react";

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCheckout: () => void;
}

export function CheckoutAuthModal({ isOpen, onClose, onGuestCheckout }: CheckoutAuthModalProps) {
  const toggleCart = useCartStore((state) => state.toggleCart);

  if (!isOpen) return null;

  const handleNavigateToAuth = () => {
    onClose();
    toggleCart(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop traslúcido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
          />

          {/* Modal Centrado */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 font-body text-white relative"
            >
              {/* Botón de Cierre */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Banner / Cabecera Informativa */}
              <div className="text-center space-y-2 pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-accent-pink/20 to-purple-900/30 border border-accent-pink/40 text-accent-pink text-xs font-mono font-bold">
                  <Award className="w-4 h-4 text-accent-pink" />
                  <span>PROGRAMA GOSU® LOYALTY</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                  ¿Cómo deseas continuar?
                </h2>

                <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
                  Inicia sesión o regístrate para acumular puntos en esta compra y canjearlos por descuentos futuros.
                </p>
              </div>

              {/* Botones de Acción Principales */}
              <div className="space-y-3 pt-2">
                {/* Opción 1-Clic: Google */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    toggleCart(false);
                    signIn("google", { callbackUrl: "/checkout" });
                  }}
                  className="w-full btn-pill bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-extrabold text-xs py-3.5 px-4 transition-all flex items-center justify-center gap-3 uppercase font-mono group hover:border-neutral-500 shadow-md"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </button>

                {/* Separador Visual */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="border-t border-neutral-800 w-full" />
                  <span className="bg-neutral-950 px-3 text-[10px] uppercase font-mono text-neutral-500 whitespace-nowrap">
                    O continúa con
                  </span>
                  <div className="border-t border-neutral-800 w-full" />
                </div>

                {/* Opción 1: Iniciar Sesión */}
                <Link
                  href="/account/login?callbackUrl=/checkout"
                  onClick={handleNavigateToAuth}
                  className="w-full btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3.5 px-4 transition-colors flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 uppercase font-mono group"
                >
                  <LogIn className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                  <span>Inicia sesión y usa tus puntos GOSU</span>
                  <ArrowRight className="w-4 h-4 text-black ml-auto" />
                </Link>

                {/* Opción 2: Crear Cuenta */}
                <Link
                  href="/account/register?callbackUrl=/checkout"
                  onClick={handleNavigateToAuth}
                  className="w-full btn-pill bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-extrabold text-xs py-3.5 px-4 transition-colors flex items-center justify-center gap-2.5 uppercase font-mono group"
                >
                  <UserPlus className="w-4 h-4 text-accent-pink group-hover:scale-110 transition-transform" />
                  <span>Crea una cuenta y gana puntos hoy</span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white ml-auto" />
                </Link>
              </div>

              {/* Opción 3: Enlace Sutil Continuar como Invitado */}
              <div className="text-center pt-2 border-t border-neutral-900">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onGuestCheckout();
                  }}
                  className="text-xs text-neutral-400 hover:text-white underline font-mono transition-colors inline-flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Continuar como invitado</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
