"use client";

import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Sparkles, Lock, ArrowRight, CheckCircle2, Loader2, Eye, EyeOff, Award } from "lucide-react";
import { convertGuestOrderToUserAction } from "@/actions/userActions";

interface GuestAccountConvertUpsellProps {
  orderId?: string;
  guestEmail?: string;
  guestName?: string;
}

export function GuestAccountConvertUpsell({
  orderId,
  guestEmail = "",
  guestName = "",
}: GuestAccountConvertUpsellProps) {
  const { data: session } = useSession();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Si el usuario ya está autenticado, no mostrar la invitación de conversión
  if (session?.user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password || password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await convertGuestOrderToUserAction({
        email: guestEmail,
        password,
        orderId,
        name: guestName,
      });

      if (!res.success) {
        throw new Error(res.error || "No se pudo crear la cuenta.");
      }

      setIsSuccess(true);

      // Iniciar sesión automáticamente en NextAuth
      await signIn("credentials", {
        redirect: false,
        email: guestEmail,
        password: password,
      });
    } catch (err: any) {
      console.error("Error convirtiendo cuenta:", err);
      setErrorMessage(err.message || "Ocurrió un error al crear tu cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mt-8 p-6 bg-gradient-to-br from-neutral-900 to-black rounded-2xl border border-emerald-500/30 text-center space-y-3 shadow-xl max-w-md mx-auto animate-in fade-in">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="font-extrabold text-base text-white uppercase">¡Cuenta Creada Exitosamente!</h3>
        <p className="text-xs text-neutral-400">
          Tu pedido y tus puntos de fidelidad han sido vinculados a tu nueva cuenta <span className="text-white font-mono">{guestEmail}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black rounded-2xl border border-accent-pink/40 shadow-2xl max-w-md mx-auto space-y-4 text-left font-body relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-accent-pink/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-accent-pink/10 text-accent-pink border border-accent-pink/20">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold text-accent-pink uppercase tracking-widest block">
            GOSU® VIP UPSELL
          </span>
          <h3 className="font-extrabold text-base text-white uppercase tracking-tight">
            ¡Guarda tu Pedido en 1-Clic!
          </h3>
        </div>
      </div>

      <p className="text-xs text-neutral-400 leading-relaxed">
        Crea una clave para registrar tu cuenta con el correo <span className="text-white font-mono font-bold">{guestEmail || "tu correo"}</span>. Acumularás los puntos de esta compra y podrás ver tu historial de pedidos.
      </p>

      {errorMessage && (
        <p className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
          {errorMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[11px] font-mono text-neutral-300 mb-1 uppercase font-bold">
            Crea tu Contraseña *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full pl-9 pr-10 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-pink font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-pill bg-white hover:bg-accent-pink text-black font-extrabold text-xs py-3 px-4 transition-all flex items-center justify-center gap-2 uppercase font-mono shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creando Cuenta...</span>
            </>
          ) : (
            <>
              <span>CREAR MI CUENTA Y ACUMULAR PUNTOS</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
