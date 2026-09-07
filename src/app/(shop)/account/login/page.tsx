"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Lock, Mail, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("Error inesperado al iniciar sesión.");
    }

    setIsLoading(false);
  };

  const registerHref = callbackUrl !== "/account/dashboard"
    ? `/account/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/account/register";

  return (
    <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-neutral-800 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono text-accent-cyan tracking-widest uppercase">
          ÁREA PRIVADA GOSU®
        </span>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">INICIAR SESIÓN</h1>
        <p className="text-xs text-neutral-400">
          Ingresa a tu cuenta para ver tus pedidos y acumular Puntos de Fidelidad.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Botón Google OAuth 1-Clic */}
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full btn-pill bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 font-extrabold text-xs py-3.5 px-4 transition-all flex items-center justify-center gap-3 uppercase font-mono group hover:border-neutral-500 shadow-md"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continuar con Google</span>
      </button>

      <div className="relative flex items-center justify-center my-3">
        <div className="border-t border-neutral-800 w-full" />
        <span className="bg-surface px-3 text-[10px] uppercase font-mono text-neutral-500 whitespace-nowrap">
          O continúa con tu correo
        </span>
        <div className="border-t border-neutral-800 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Correo Electrónico
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

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div className="flex justify-end pt-1">
            <Link
              href="/account/forgot-password"
              className="text-[11px] text-accent-cyan hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
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
              <span>INGRESAR A MI CUENTA</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
        ¿No tienes una cuenta aún?{" "}
        <Link href={registerHref} className="text-accent-cyan font-bold hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <Suspense fallback={<div className="text-white text-xs font-mono">Cargando...</div>}>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
