"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, Copy, Check, ExternalLink } from "lucide-react";

export function CopyCreatorPortalLink({
  token,
  code,
  variant = "admin",
}: {
  token: string;
  code?: string;
  variant?: "admin" | "shop";
}) {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState("https://shop.gosuaccessories.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const portalUrl = `${baseUrl}/creadores/portal?token=${token}`;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (variant === "shop") {
    return (
      <div className="p-5 bg-gradient-to-r from-neutral-900 to-black rounded-xl border border-emerald-500/40 space-y-3 font-sans">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Enlace Único de Acceso a tu Portal:</span>
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
            value={portalUrl}
            className="w-full px-3.5 py-2 bg-black border border-neutral-800 rounded-lg text-xs font-mono text-neutral-200 focus:outline-none select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "COPIADO" : "COPIAR ACCESO"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 space-y-2 font-sans">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-emerald-900 flex items-center gap-1.5 uppercase">
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>Acceso Privado al Portal del Creador (Para compartir por WhatsApp/Email)</span>
        </span>
        {copied && (
          <span className="text-[11px] font-mono text-emerald-700 font-bold flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            ¡Enlace del Portal Copiado!
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          readOnly
          value={portalUrl}
          className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-emerald-950 font-bold focus:outline-none select-all"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-sm"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "COPIADO" : "COPIAR ACCESO CREADOR"}</span>
        </button>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 shrink-0 border border-slate-300"
          title="Ver vista previa pública del portal"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>PROBAR PORTAL</span>
        </a>
      </div>
    </div>
  );
}
