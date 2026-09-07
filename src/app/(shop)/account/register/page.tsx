"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { User, Mail, Lock, ArrowRight, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { registerUserAction } from "../actions";

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account/dashboard";

  const { status } = useSession();

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);

    const res = await registerUserAction(formData);

    if (!res.success) {
      setError(res.error || "Error al crear la cuenta.");
      setIsLoading(false);
    } else {
      // Iniciar sesión automáticamente tras el registro
      const loginRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginRes?.error) {
        router.push("/account/login");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    }
  };

  const loginHref = callbackUrl !== "/account/dashboard"
    ? `/account/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/account/login";

  return (
    <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-neutral-800 shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://res.cloudinary.com/de4so8h01/image/upload/v1784049362/GosuLogo_wletc3.png"
          alt="GOSU® TCG GEAR"
          className="h-10 w-auto mx-auto mb-2 object-contain"
        />
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-pink/10 border border-accent-pink/30 text-accent-pink text-[11px] font-mono mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>¡GANA 50 PUNTOS DE BIENVENIDA!</span>
        </div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">CREAR CUENTA</h1>
        <p className="text-xs text-neutral-400">
          Regístrate para acumular puntos en cada compra y rastrear tus pedidos.
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
          O crea tu cuenta con correo
        </span>
        <div className="border-t border-neutral-800 w-full" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Nombre</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Juan"
              className="w-full px-3.5 py-3 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Apellido</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Pérez"
              className="w-full px-3.5 py-3 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>
        </div>

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
              placeholder="juan@email.com"
              className="w-full pl-10 pr-4 py-3 bg-black border border-neutral-700 rounded-xl text-xs font-medium text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
            Contraseña (mínimo 6 caracteres)
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
              <span>REGISTRARSE Y OBTENER 50 PUNTOS</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-neutral-800 text-xs text-neutral-400">
        ¿Ya tienes cuenta?{" "}
        <Link href={loginHref} className="text-accent-cyan font-bold hover:underline">
          Inicia sesión aquí
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-12">
      <Suspense fallback={<div className="text-white text-xs font-mono">Cargando...</div>}>
        <RegisterFormContent />
      </Suspense>
    </div>
  );
}
