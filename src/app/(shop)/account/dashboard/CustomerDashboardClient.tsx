"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Award,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Trophy,
  Flame,
  UserCheck,
  Target,
  Cake,
  Star,
  CheckCircle2,
  Calendar,
  Phone,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { completeUserProfileMissionAction } from "../actions";

interface TierItem {
  id: string;
  name: string;
  minPoints: number;
  badgeImageUrl?: string | null;
  perks?: string | null;
}

interface RuleItem {
  id: string;
  actionType: string;
  pointsReward: number;
  isActive: boolean;
}

interface CustomerDashboardProps {
  userName: string;
  userEmail: string;
  userId: string;
  loyaltyPoints: number;
  userOrdersCount: number;
  birthdate?: string | Date | null;
  phone?: string | null;
  isProfileCompleted: boolean;
  tiers: TierItem[];
  rules: RuleItem[];
}

export default function CustomerDashboardClient({
  userName,
  userEmail,
  userId,
  loyaltyPoints,
  userOrdersCount,
  birthdate,
  phone,
  isProfileCompleted,
  tiers,
  rules,
}: CustomerDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [birthdateInput, setBirthdateInput] = useState(
    birthdate ? new Date(birthdate).toISOString().split("T")[0] : ""
  );
  const [phoneInput, setPhoneInput] = useState(phone || "");
  const [missionMessage, setMissionMessage] = useState<string | null>(null);

  // 1. Determinar el Nivel Actual Dinámico desde Neon DB
  let currentTier: TierItem | null = null;
  let nextTier: TierItem | null = null;

  if (tiers.length > 0) {
    const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints);
    for (let i = 0; i < sortedTiers.length; i++) {
      if (loyaltyPoints >= sortedTiers[i].minPoints) {
        currentTier = sortedTiers[i];
      } else {
        nextTier = sortedTiers[i];
        break;
      }
    }
    if (!currentTier) currentTier = sortedTiers[0];
  }

  const rankTitle = currentTier ? currentTier.name : "Nivel Contender 🥉";
  const nextRankPoints = nextTier ? nextTier.minPoints : currentTier ? currentTier.minPoints : 1000;
  const currentMinPoints = currentTier ? currentTier.minPoints : 0;
  const ptsNeeded = nextTier ? Math.max(0, nextTier.minPoints - loyaltyPoints) : 0;

  const rankProgress = nextTier
    ? Math.min(100, Math.max(0, ((loyaltyPoints - currentMinPoints) / (nextTier.minPoints - currentMinPoints)) * 100))
    : 100;

  // 2. Misión de Perfil Completo
  const profileRule = rules.find((r) => r.actionType === "PROFILE_COMPLETION" && r.isActive);

  const handleCompleteProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthdateInput) {
      alert("Por favor ingresa tu fecha de nacimiento.");
      return;
    }

    startTransition(async () => {
      const res = await completeUserProfileMissionAction(userId, birthdateInput, phoneInput);
      if (res.success) {
        setMissionMessage(res.message || "¡Misión completada!");
        setShowProfileModal(false);
      } else {
        alert(res.error || "Ocurrió un error al guardar.");
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-body text-white">
      {/* Header del Cliente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-surface rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4">
          {currentTier?.badgeImageUrl ? (
            <img
              src={currentTier.badgeImageUrl}
              alt={rankTitle}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-pink shadow-lg shadow-accent-pink/20 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center font-extrabold text-2xl uppercase">
              {userName.substring(0, 2)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest">
                JUGADOR TCG
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-accent-pink/40 text-accent-pink bg-accent-pink/10 font-bold">
                {rankTitle}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white mt-0.5">
              {userName}
            </h1>
            <span className="text-xs text-neutral-400 font-mono">{userEmail}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SignOutButton />
        </div>
      </div>

      {/* Tarjetas de Estadísticas & Rangos Dinámicos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tarjeta de Puntos de Fidelidad & Rango */}
        <div className="p-6 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 rounded-2xl border border-accent-pink/40 shadow-xl relative overflow-hidden space-y-3">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-accent-pink/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-pink uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> GOSU® LOYALTY
            </span>
            <Award className="w-6 h-6 text-accent-pink" />
          </div>

          <div>
            <span className="text-4xl font-black text-white font-mono block">
              {loyaltyPoints} <span className="text-xs text-neutral-400 font-normal">pts</span>
            </span>
            <span className="text-xs text-neutral-300 block font-semibold mt-0.5">
              = S/. {(loyaltyPoints / 40).toFixed(2)} PEN de descuento (40 Pts = S/. 1)
            </span>
          </div>

          {/* Barra de Progreso a Siguiente Rango */}
          <div className="pt-2 border-t border-neutral-800 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Siguiente Rango</span>
              <span>{nextTier ? `Faltan ${ptsNeeded} pts` : "¡Nivel Máximo Alcanzado!"}</span>
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-accent-cyan via-purple-500 to-accent-pink transition-all duration-500"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta de Compras */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
              MIS COMPRAS
            </span>
            <ShoppingBag className="w-5 h-5 text-accent-cyan" />
          </div>
          <div>
            <span className="text-3xl font-extrabold text-white font-mono block">
              {userOrdersCount} {userOrdersCount === 1 ? "Pedido" : "Pedidos"}
            </span>
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1 text-xs text-accent-cyan font-bold hover:underline mt-2"
            >
              <span>Ver historial completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Tarjeta de Beneficios del Nivel Actual */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
              BENEFICIOS DE NIVEL
            </span>
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white uppercase block leading-tight">
              {rankTitle}
            </span>
            <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
              {currentTier?.perks || "Gana puntos con cada compra y desbloquea beneficios exclusivos TCG."}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN INTERACTIVA: MISIONES DISPONIBLES (Smile.io Style) */}
      <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase text-white tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span>Misiones Disponibles & Formas de Ganar Puntos</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Completa misiones activas para subir de nivel rápidamente y acumular descuentos.
            </p>
          </div>

          {missionMessage && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold font-mono">
              {missionMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Misión 1: Bono de Registro */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Bono de Bienvenida</span>
                <span className="text-[11px] text-neutral-400">Otorgado al crear tu cuenta.</span>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completada
            </span>
          </div>

          {/* Misión 2: Perfil Completo (Interactive Action) */}
          {profileRule && (
            <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Completa tu Perfil</span>
                  <span className="text-[11px] text-neutral-400">
                    Gana +{profileRule.pointsReward} pts ingresando tu fecha de nacimiento.
                  </span>
                </div>
              </div>

              {isProfileCompleted ? (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completada
                </span>
              ) : (
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Completa y gana {profileRule.pointsReward} pts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Misión 3: Compras */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-accent-cyan/10 rounded-xl text-accent-cyan">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Acumulación por Compras</span>
                <span className="text-[11px] text-neutral-400">Gana 1 punto por cada S/. 1 / $1 gastado.</span>
              </div>
            </div>
            <Link
              href="/"
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Comprar Ahora
            </Link>
          </div>

          {/* Misión 4: Cumpleaños */}
          <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 rounded-xl text-pink-400">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Regalo de Cumpleaños</span>
                <span className="text-[11px] text-neutral-400">
                  {birthdate ? `Registrado: ${new Date(birthdate).toLocaleDateString()}` : "Regala tu fecha de nacimiento."}
                </span>
              </div>
            </div>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs font-mono font-bold rounded-lg">
              Anual
            </span>
          </div>
        </div>
      </div>

      {/* Modal Interactivo para Completar Perfil */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 rounded-2xl max-w-md w-full p-6 space-y-5 border border-neutral-800 text-white shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-purple-400" />
                <span>Completa tu Perfil (+{profileRule?.pointsReward || 20} pts)</span>
              </h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteProfileSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  value={birthdateInput}
                  onChange={(e) => setBirthdateInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-400" /> Teléfono de Contacto (Opcional)
                </label>
                <input
                  type="tel"
                  placeholder="+51 987 654 321"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 font-bold text-xs rounded-xl hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-purple-600/20 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Reclamar +{profileRule?.pointsReward || 20} Pts</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
