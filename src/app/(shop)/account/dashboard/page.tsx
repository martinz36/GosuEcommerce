import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { User, Award, ShoppingBag, LogOut, Shield, ChevronRight, Sparkles, Trophy, Flame } from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export const revalidate = 0;

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/account/login");
  }

  const userId = (session.user as any).id;

  let dbUser: any = null;
  let userOrdersCount = 0;

  try {
    if (process.env.DATABASE_URL && userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: true,
        },
      });

      if (dbUser) {
        userOrdersCount = dbUser.orders.length;
      }
    }
  } catch (err) {
    console.error("Error al cargar perfil de usuario en Neon DB:", err);
  }

  const userName: string = dbUser?.firstName
    ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
    : session.user.name || session.user.email?.split("@")[0] || "Cliente";

  const userEmail = dbUser?.email || session.user.email || "N/A";
  const loyaltyPoints = dbUser?.loyaltyPoints || (session.user as any).loyaltyPoints || 0;
  const role = dbUser?.role || (session.user as any).role || "CUSTOMER";

  // NUEVA TEMÁTICA Y MATEMÁTICA DE NIVELES GAMIFICADOS (CONTENDER, META PLAYER, GOSU CHAMPION)
  let rankTitle = "Nivel CONTENDER 🥉";
  let rankBadgeColor = "border-emerald-500/30 text-emerald-400 bg-emerald-500/10";
  let nextRankPoints = 300;
  let rankProgress = Math.min(100, (loyaltyPoints / 300) * 100);

  if (loyaltyPoints >= 1000) {
    rankTitle = "Nivel GOSU CHAMPION 🥇";
    rankBadgeColor = "border-amber-500/50 text-amber-400 bg-amber-500/10 font-bold shadow-lg shadow-amber-500/10";
    nextRankPoints = 1000;
    rankProgress = 100;
  } else if (loyaltyPoints >= 300) {
    rankTitle = "Nivel META PLAYER 🥈";
    rankBadgeColor = "border-purple-500/40 text-purple-300 bg-purple-500/10";
    nextRankPoints = 1000;
    rankProgress = Math.min(100, ((loyaltyPoints - 300) / 700) * 100);
  }

  const ptsNeeded = Math.max(0, nextRankPoints - loyaltyPoints);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-body">
      {/* Header del Cliente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-surface rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center font-extrabold text-2xl uppercase">
            {userName.substring(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest">
                JUGADOR TCG
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${rankBadgeColor}`}>
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

      {/* Tarjetas de Estadísticas & Rangos Gamificados (CONTENDER / META PLAYER / GOSU CHAMPION) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tarjeta de Puntos de Fidelización & Rango */}
        <div className="p-6 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 rounded-2xl border border-accent-pink/40 shadow-xl relative overflow-hidden space-y-3">
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-accent-pink/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-accent-pink uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4" /> GOSU® LOYALTY (2.5%)
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

          {/* Barra de Progreso a los Umbrales (300 y 1000 Puntos) */}
          <div className="pt-2 border-t border-neutral-800 space-y-1">
            <div className="flex justify-between text-[11px] font-mono text-neutral-400">
              <span>Siguiente Rango</span>
              <span>{loyaltyPoints >= 1000 ? "¡GOSU CHAMPION Alcanzado!" : `Faltan ${ptsNeeded} pts`}</span>
            </div>
            <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-purple-500 to-amber-400 transition-all duration-500"
                style={{ width: `${rankProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta de Historial de Órdenes */}
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

        {/* Tarjeta de Rango TCG */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
              NIVEL COMPETITIVO
            </span>
            <Flame className="w-5 h-5 text-accent-yellow" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-white font-mono uppercase block">
              {rankTitle}
            </span>
            <Link
              href="/account/affiliate"
              className="inline-flex items-center gap-1 text-xs text-purple-400 font-bold hover:underline mt-2"
            >
              <span>Portal del Afiliado / Creador</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Menú de Acceso Rápido */}
      <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="p-4 bg-black rounded-xl border border-neutral-800 hover:border-neutral-700 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-accent-cyan" />
              <div>
                <span className="font-bold text-xs text-white block group-hover:text-accent-cyan transition-colors">
                  Mis Pedidos
                </span>
                <span className="text-[11px] text-neutral-500">Historial y recibos.</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </Link>

          <Link
            href="/account/affiliate"
            className="p-4 bg-black rounded-xl border border-neutral-800 hover:border-neutral-700 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-purple-400" />
              <div>
                <span className="font-bold text-xs text-white block group-hover:text-purple-400 transition-colors">
                  Mi Código de Creador
                </span>
                <span className="text-[11px] text-neutral-500">Comisiones y referidos.</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </Link>

          <Link
            href="/"
            className="p-4 bg-black rounded-xl border border-neutral-800 hover:border-neutral-700 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-accent-pink" />
              <div>
                <span className="font-bold text-xs text-white block group-hover:text-accent-pink transition-colors">
                  Ir a la Tienda
                </span>
                <span className="text-[11px] text-neutral-500">Explora productos.</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
