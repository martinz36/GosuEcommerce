import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { User, Award, ShoppingBag, LogOut, Shield, ChevronRight } from "lucide-react";
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

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-body">
      {/* Header del Cliente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-surface rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center font-extrabold text-2xl uppercase">
            {userName.substring(0, 2)}
          </div>
          <div>
            <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block">
              BIENVENIDO DE VUELTA
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white">
              {userName}
            </h1>
            <span className="text-xs text-neutral-400 font-mono">{userEmail}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SignOutButton />
        </div>
      </div>

      {/* Tarjetas de Estadísticas & Puntos de Fidelidad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tarjeta de Puntos de Fidelización */}
        <div className="p-6 bg-gradient-to-br from-neutral-900 to-black rounded-2xl border border-accent-pink/30 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent-pink/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-accent-pink uppercase tracking-widest">
              PROGRAMA GOSU® LOYALTY
            </span>
            <Award className="w-6 h-6 text-accent-pink" />
          </div>
          <span className="text-4xl font-black text-white font-mono block">
            {loyaltyPoints}
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            Puntos acumulados para canjear en tus próximas compras.
          </span>
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

        {/* Tarjeta de Nivel / Rol */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
              TIPO DE CUENTA
            </span>
            <Shield className="w-5 h-5 text-accent-yellow" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-white font-mono uppercase block">
              {role}
            </span>
            <span className="text-xs text-neutral-400 block mt-1">
              Miembro desde {dbUser ? new Date(dbUser.createdAt).toLocaleDateString() : "2026"}
            </span>
          </div>
        </div>
      </div>

      {/* Menú de Acceso Rápido */}
      <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-4">
        <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/account/orders"
            className="p-4 bg-black rounded-xl border border-neutral-800 hover:border-neutral-700 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-accent-cyan" />
              <div>
                <span className="font-bold text-xs text-white block group-hover:text-accent-cyan transition-colors">
                  Mis Pedidos & Recibos
                </span>
                <span className="text-[11px] text-neutral-500">Consulta el estado y seguimiento de tus compras.</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </Link>

          <Link
            href="/"
            className="p-4 bg-black rounded-xl border border-neutral-800 hover:border-neutral-700 flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-accent-pink" />
              <div>
                <span className="font-bold text-xs text-white block group-hover:text-accent-pink transition-colors">
                  Ir a la Tienda Pública
                </span>
                <span className="text-[11px] text-neutral-500">Explora el catálogo e intercambia tus puntos.</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white" />
          </Link>
        </div>
      </div>
    </div>
  );
}
