"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { useStoreSettings } from "@/providers/StoreProvider";

interface CurrencySwitcherProps {
  variant?: "clean" | "capsule";
}

export function CurrencySwitcher({ variant = "clean" }: CurrencySwitcherProps) {
  const router = useRouter();
  const { currency } = useStoreSettings();

  const handleCurrencyChange = (newCurrency: string) => {
    document.cookie = `user-currency=${newCurrency}; path=/; max-age=${60 * 60 * 24 * 30}`;
    router.refresh();
  };

  if (variant === "clean") {
    return (
      <div className="relative inline-flex items-center text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group">
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="bg-transparent text-neutral-300 font-bold hover:text-white cursor-pointer focus:outline-none text-[11px] uppercase appearance-none pr-3 py-0.5"
        >
          <option value="PEN" className="bg-neutral-900 text-white">PEN (S/.)</option>
          <option value="USD" className="bg-neutral-900 text-white">USD ($)</option>
        </select>
        <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-white pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
      </div>
    );
  }

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
