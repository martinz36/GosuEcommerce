"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, LogIn, UserPlus, ArrowRight, ShoppingBag } from "lucide-react";

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestCheckout: () => void;
}

export function CheckoutAuthModal({ isOpen, onClose, onGuestCheckout }: CheckoutAuthModalProps) {
  if (!isOpen) return null;

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
                {/* Opción 1: Iniciar Sesión (Destacado) */}
                <Link
                  href="/account/login?callbackUrl=/checkout"
                  onClick={onClose}
                  className="w-full btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3.5 px-4 transition-colors flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 uppercase font-mono group"
                >
                  <LogIn className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                  <span>Inicia sesión y usa tus puntos GOSU</span>
                  <ArrowRight className="w-4 h-4 text-black ml-auto" />
                </Link>

                {/* Opción 2: Crear Cuenta (Secundario) */}
                <Link
                  href="/account/register?callbackUrl=/checkout"
                  onClick={onClose}
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
