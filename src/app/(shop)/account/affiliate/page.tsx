import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, Award, DollarSign, Copy, CheckCircle2, ShoppingBag, Users, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function CustomerAffiliatePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/account/login");
  }

  const userId = (session.user as any).id;

  let affiliateCodes: any[] = [];
  let commissions: any[] = [];
  let userRecord: any = null;

  try {
    if (process.env.DATABASE_URL && userId) {
      userRecord = await prisma.user.findUnique({
        where: { id: userId },
      });

      affiliateCodes = await prisma.discountCode.findMany({
        where: { createdById: userId },
        include: {
          orders: true,
        },
      });

      commissions = await prisma.commissionLog.findMany({
        where: { affiliateId: userId },
        include: {
          order: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al cargar datos de afiliado en Neon DB:", err);
  }

  const totalCommissionsEarned = commissions.reduce((sum, c) => sum + Number(c.commissionAmount), 0);
  const totalOrdersGenerated = affiliateCodes.reduce((sum, c) => sum + (c.orders ? c.orders.length : 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-body">
      <Link
        href="/account/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-accent-cyan transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Mi Cuenta</span>
      </Link>

      {/* Header del Creador / Afiliado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-8 bg-surface rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">
                PROGRAMA CREADORES GOSU®
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-purple-500/40 text-purple-300 bg-purple-500/10">
                AFILIADO OFICIAL
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white mt-0.5">
              Portal del Afiliado
            </h1>
            <span className="text-xs text-neutral-400 font-mono">Gana comisiones compartiendo tu código con la comunidad TCG.</span>
          </div>
        </div>
      </div>

      {/* Si aún no tiene un código de creador asignado */}
      {affiliateCodes.length === 0 ? (
        <div className="p-8 bg-surface rounded-2xl border border-neutral-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-purple-900/20 border border-purple-800 flex items-center justify-center mx-auto text-purple-400">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">¿Eres Streamer, Juzgador o Creador TCG?</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              Solicita tu código de creador personalizado para ofrecer 10% de descuento a tus seguidores y ganar 10% de comisión por cada compra realizada.
            </p>
          </div>
          <a
            href="mailto:afiliados@gosutcg.pe?subject=Solicitud de Código de Creador TCG"
            className="inline-flex items-center gap-2 btn-pill bg-white text-black font-extrabold text-xs hover:bg-accent-cyan transition-colors"
          >
            <span>Solicitar Código de Creador</span>
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tarjetas de Métricas de Afiliado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-neutral-900 to-black rounded-2xl border border-purple-500/40 shadow-xl space-y-2">
              <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest block">
                COMISIONES ACUMULADAS
              </span>
              <span className="text-4xl font-black text-white font-mono block">
                ${totalCommissionsEarned.toFixed(2)} USD
              </span>
              <span className="text-xs text-neutral-400 block">
                Ganancias netas acumuladas por tus ventas.
              </span>
            </div>

            <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                VENTAS GENERADAS
              </span>
              <span className="text-3xl font-extrabold text-white font-mono block">
                {totalOrdersGenerated} {totalOrdersGenerated === 1 ? "Venta" : "Ventas"}
              </span>
            </div>

            <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest">
                TASA DE COMISIÓN
              </span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono block">
                {Number(affiliateCodes[0]?.commissionRate || 10)}% por Venta
              </span>
            </div>
          </div>

          {/* Caja con Código de Creador & Link Personalizado */}
          <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">Tu Código de Creador</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {affiliateCodes.map((c) => (
                <div key={c.id} className="p-4 bg-black rounded-xl border border-purple-500/30 space-y-2">
                  <span className="text-[11px] font-mono text-neutral-400 block">CÓDIGO DE CUPÓN:</span>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-purple-400 font-mono">{c.code}</span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      10% OFF para tus seguidores
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de Comisiones & Registro de Ventas */}
          <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-white tracking-wider">Historial de Ventas & Comisiones</h3>

            {commissions.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">Aún no se han registrado ventas con tu código de creador.</p>
            ) : (
              <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-xl overflow-hidden bg-black/40">
                {commissions.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-accent-cyan font-bold block">
                        Pedido {log.order?.orderNumber || "GOSU-ORDER"}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-emerald-400 font-extrabold text-sm block">
                        +${Number(log.commissionAmount).toFixed(2)} USD
                      </span>
                      <span className="text-[10px] text-neutral-400">
                        {log.isPaid ? "Liquidado" : "Pendiente de pago"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
