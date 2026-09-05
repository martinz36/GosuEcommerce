"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    // Vaciar el carrito local cuando el pago fue exitoso
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 animate-bounce">
        <CheckCircle className="w-10 h-10" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
        ¡Pago Completado con Éxito!
      </h1>
      <p className="text-sm text-neutral-400 max-w-md mt-3 leading-relaxed">
        Gracias por tu compra en <span className="text-accent-cyan font-bold">GOSU® TCG</span>. Hemos recibido tu pedido correctamente y estamos procesando tu orden.
      </p>

      {sessionId && (
        <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-400">
          ID de Transacción: <span className="text-white">{sessionId.substring(0, 24)}...</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <Link
          href="/account/orders"
          className="btn-pill bg-white text-black font-extrabold text-xs px-6 py-3 hover:bg-accent-cyan transition-colors flex items-center gap-2"
        >
          <span>Ver Mis Pedidos</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/products"
          className="btn-pill bg-neutral-900 text-white border border-neutral-700 font-bold text-xs px-6 py-3 hover:bg-neutral-800 transition-colors flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4 text-accent-pink" />
          <span>Seguir Comprando</span>
        </Link>
      </div>
    </div>
  );
}
