"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutCancelPage() {
  const toggleCart = useCartStore((state) => state.toggleCart);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-6">
        <XCircle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
        Pago Cancelado
      </h1>
      <p className="text-sm text-neutral-400 max-w-md mt-3 leading-relaxed">
        El proceso de pago fue cancelado o interrumputo. Tus productos siguen guardados en el carrito para cuando estés listo.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <button
          onClick={() => toggleCart(true)}
          className="btn-pill bg-white text-black font-extrabold text-xs px-6 py-3 hover:bg-accent-cyan transition-colors flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Volver al Carrito</span>
        </button>
        <Link
          href="/products"
          className="btn-pill bg-neutral-900 text-white border border-neutral-700 font-bold text-xs px-6 py-3 hover:bg-neutral-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explorar Productos</span>
        </Link>
      </div>
    </div>
  );
}
