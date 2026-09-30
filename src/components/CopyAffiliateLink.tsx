"use client";

import React, { useState, useEffect } from "react";
import { Link2, Copy, Check } from "lucide-react";

export function CopyAffiliateLink({ code, variant = "admin" }: { code: string; variant?: "admin" | "shop" }) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://shop.gosuaccessories.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const fullRefUrl = `${baseUrl}/?ref=${code}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(fullRefUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (variant === "shop") {
    return (
      <div className="p-5 bg-gradient-to-r from-neutral-900 to-black rounded-xl border border-purple-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Link2 className="w-4 h-4" />
            <span>Enlace Directo de Afiliado (?ref={code}):</span>
          </span>
          {copied && (
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              ¡Enlace Copiado!
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            readOnly
            value={fullRefUrl}
            className="w-full px-3.5 py-2 bg-black border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "COPIADO" : "COPIAR ENLACE"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-4 space-y-2 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-purple-900 flex items-center gap-1.5 uppercase">
          <Link2 className="w-4 h-4 text-purple-600" />
          <span>Enlace de Afiliado para Compartir (?ref={code})</span>
        </span>
        {copied && (
          <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            ¡Enlace Copiado!
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          readOnly
          value={fullRefUrl}
          className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono text-purple-900 font-bold focus:outline-none select-all"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-mono font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "COPIADO" : "COPIAR ENLACE"}</span>
        </button>
      </div>
    </div>
  );
}
