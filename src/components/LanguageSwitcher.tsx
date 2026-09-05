"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useStoreSettings } from "@/providers/StoreProvider";

export function LanguageSwitcher() {
  const router = useRouter();
  const { language } = useStoreSettings();

  const handleLanguageChange = (newLang: string) => {
    // Establecer la cookie de preferencia manual de idioma
    document.cookie = `user-lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 30}`;
    // Revalidar y refrescar la página
    router.refresh();
  };

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
