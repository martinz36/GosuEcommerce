"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Languages } from "lucide-react";
import { useStoreSettings } from "@/providers/StoreProvider";

interface LanguageSwitcherProps {
  variant?: "clean" | "capsule";
}

export function LanguageSwitcher({ variant = "clean" }: LanguageSwitcherProps) {
  const router = useRouter();
  const { language } = useStoreSettings();

  const handleLanguageChange = (newLang: string) => {
    document.cookie = `user-lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 30}`;
    router.refresh();
  };

  if (variant === "clean") {
    return (
      <div className="relative inline-flex items-center text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer group">
        <select
          value={language || "es"}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="bg-transparent text-neutral-300 font-bold hover:text-white cursor-pointer focus:outline-none text-[11px] uppercase appearance-none pr-3 py-0.5"
        >
          <option value="es" className="bg-neutral-900 text-white">ES</option>
          <option value="en" className="bg-neutral-900 text-white">EN</option>
        </select>
        <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-white pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-surface-elevated border border-neutral-800 rounded-full px-2.5 py-1 text-xs font-mono">
      <Languages className="w-3.5 h-3.5 text-accent-pink shrink-0" />
      <select
        value={language || "es"}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-transparent text-white font-bold cursor-pointer focus:outline-none text-[11px] uppercase"
      >
        <option value="es" className="bg-black text-white">
          ES
        </option>
        <option value="en" className="bg-black text-white">
          EN
        </option>
      </select>
    </div>
  );
}
