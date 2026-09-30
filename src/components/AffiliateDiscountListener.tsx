"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, X, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export function AffiliateDiscountListener() {
  const searchParams = useSearchParams();
  const { applyDiscount, discount, getSubtotal } = useCartStore();
  const [bannerInfo, setBannerInfo] = useState<{ creatorName: string; value: number } | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    async function checkAndApplyAffiliateCode() {
      // 1. Obtener código de URL (?ref=...) o cookie (gosu_affiliate_code)
      const refUrlParam = searchParams.get("ref");
      const cookieCode = getCookie("gosu_affiliate_code");
      const targetCode = refUrlParam || cookieCode;

      if (!targetCode) return;

      const cleanCode = targetCode.trim().toUpperCase();

      try {
        const res = await fetch(`/api/affiliates/validate?code=${encodeURIComponent(cleanCode)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.isValid) {
            const subtotal = getSubtotal();
            const val = Number(data.value || 10);
            const calcDiscount = data.type === "PERCENTAGE" ? (subtotal * val) / 100 : val;

            // Auto-aplicar cupón si no hay uno aplicado o si viene directamente por URL ?ref
            if (!discount || refUrlParam || discount.code !== data.code) {
              applyDiscount({
                code: data.code,
                type: data.type,
                value: val,
                discountAmount: calcDiscount,
                maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
              });
            }

            setBannerInfo({
              creatorName: data.creatorName,
              value: val,
            });
          }
        }
      } catch (err) {
        console.error("Error al validar enlace de afiliado:", err);
      }
    }

    checkAndApplyAffiliateCode();
  }, [searchParams, discount?.code]);

  if (!bannerInfo || isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-black border-b border-purple-500/30 text-white px-4 py-2.5 text-xs font-mono transition-all animate-in slide-in-from-top duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="truncate">
            Has ingresado con el enlace de <strong className="text-purple-300 font-bold">{bannerInfo.creatorName}</strong>. ¡{bannerInfo.value}% de descuento aplicado!
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="text-neutral-400 hover:text-white transition-colors p-1 shrink-0"
          title="Ocultar aviso"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
