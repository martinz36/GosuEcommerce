"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { useStoreSettings } from "@/providers/StoreProvider";

export function CurrencySwitcher() {
  const router = useRouter();
  const { currency } = useStoreSettings();

  const handleCurrencyChange = (newCurrency: string) => {
    // Establecer la cookie de preferencia manual de moneda
    document.cookie = `user-currency=${newCurrency}; path=/; max-age=${60 * 60 * 24 * 30}`;
    // Revalidar y refrescar la página
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1.5 bg-surface-elevated border border-neutral-800 rounded-full px-3 py-1 text-xs font-mono">
      <Globe className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
      <select
        value={currency}
        onChange={(e) => handleCurrencyChange(e.target.value)}
        className="bg-transparent text-white font-bold cursor-pointer focus:outline-none text-[11px]"
      >
        <option value="PEN" className="bg-black text-white">
          PEN (S/.)
        </option>
        <option value="USD" className="bg-black text-white">
          USD ($)
        </option>
      </select>
    </div>
  );
}
