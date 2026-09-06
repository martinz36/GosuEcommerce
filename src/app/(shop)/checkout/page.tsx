"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/providers/StoreProvider";

export default function CheckoutLandingPage() {
  const router = useRouter();
  const { items, discount, loyaltyPointsUsed } = useCartStore();
  const { currency, countryCode } = useStoreSettings();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/");
      return;
    }

    const proceedToCheckout = async () => {
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items,
            discountCode: discount,
            loyaltyPointsUsed,
            currency: currency.toLowerCase(),
            countryCode,
          }),
        });

        const data = await res.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || "Ocurrió un error al preparar el pago.");
        }
      } catch (err) {
        console.error("Error en checkout landing:", err);
        setError("Error al conectar con la pasarela de pagos.");
      }
    };

    proceedToCheckout();
  }, [items, discount, loyaltyPointsUsed, currency, countryCode, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-4 font-body">
      {error ? (
        <div className="p-6 bg-surface border border-rose-500/30 rounded-2xl max-w-md space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-white uppercase">Error de Procesamiento</h2>
          <p className="text-xs text-neutral-400">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="btn-pill bg-white text-black font-bold text-xs py-3 px-6 hover:bg-accent-cyan transition-colors"
          >
            Volver a la Tienda
          </button>
        </div>
      ) : (
        <div className="p-8 bg-surface border border-neutral-800 rounded-2xl max-w-md space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center mx-auto text-accent-cyan">
            <Loader2 className="w-7 h-7 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
              PROCESANDO TU CHECKOUT...
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Te estamos redirigiendo de forma segura a Stripe para completar tu compra con tus puntos GOSU®.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
