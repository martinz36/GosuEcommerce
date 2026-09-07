"use client";

import React, { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { subscribeNewsletterAction } from "@/app/(shop)/actions";

export function NewsletterFooter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage(null);

    const res = await subscribeNewsletterAction(email.trim());

    if (res.success) {
      setStatus("success");
      setEmail("");
      setMessage("¡Suscrito con éxito! Revisa tu correo de bienvenida.");
    } else {
      setStatus("error");
      setMessage(res.error || "Error al suscribir.");
    }
  };

  return (
    <div className="bg-surface-elevated border border-neutral-800 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto my-8 text-center space-y-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono">
        <Mail className="w-4 h-4" />
        <span>GOSU® CLUB NEWSLETTER</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
        Recibe Lanzamientos & Descuentos Secretos
      </h3>

      <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
        Sé el primero en enterarte sobre reposiciones de binders, sleeves mate y códigos promocionales exclusivos.
      </p>

      {status === "success" ? (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center justify-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-xs py-3 px-6 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 uppercase font-mono disabled:opacity-50"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Unirme</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-[11px] text-rose-400 font-mono">{message}</p>
      )}
    </div>
  );
}
