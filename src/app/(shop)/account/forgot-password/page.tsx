"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulación de envío de correo de recuperación
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSent(true);
    } catch (err) {
      setError("Ocurrió un error al intentar enviar el correo de recuperación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-neutral-800 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono text-accent-cyan tracking-widest uppercase">
            RECUPERACIÓN DE CUENTA
          </span>
          <h1 className="text-3xl font-extrabold uppercase tracking-tight">¿OLVIDASTE TU CONTRASEÑA?</h1>
          <p className="text-xs text-neutral-400">
            Ingresa tu correo electrónico registrado para enviarte las instrucciones de restablecimiento.
          </p>
        </div>

        {isSent ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-white">¡Enlace Enviado!</h3>
            <p className="text-xs text-neutral-300">
              Si el correo <strong className="text-accent-cyan">{email}</strong> está registrado, recibirás un mensaje con las instrucciones en breve.
            </p>
            <div className="pt-2">
              <Link
                href="/account/login"
                className="btn-pill bg-white text-black font-extrabold text-xs px-6 py-2.5 hover:bg-accent-cyan transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver al Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-pill bg-white text-black font-extrabold text-xs py-3.5 hover:bg-accent-cyan transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>ENVIAR INSTRUCCIONES</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/account/login"
                className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Regresar al Inicio de Sesión</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
