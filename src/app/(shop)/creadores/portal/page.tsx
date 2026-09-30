import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { CopyAffiliateLink } from "@/components/CopyAffiliateLink";
import { CopyCreatorPortalLink } from "@/components/CopyCreatorPortalLink";
import { AffiliateBankDetailsForm } from "@/components/AffiliateBankDetailsForm";
import {
  Award,
  DollarSign,
  Package,
  Sparkles,
  ArrowLeft,
  Lock,
  CheckCircle2,
  Users,
  ShieldCheck,
} from "lucide-react";

export const revalidate = 0;

interface PageProps {
  searchParams: {
    token?: string;
    code?: string;
  };
}

export default async function PublicCreatorPortalPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const paramToken = (searchParams.token || searchParams.code || "").trim();

  let codeRecord: any = null;
  let commissions: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      if (paramToken) {
        // 1. Intentar buscar código de afiliado por ID (token), por código exacto o por ID de creador
        codeRecord = await prisma.discountCode.findFirst({
          where: {
            OR: [
              { id: paramToken },
              { code: paramToken.toUpperCase() },
              { createdById: paramToken },
            ],
            category: "AFFILIATE",
          },
          include: {
            createdBy: true,
          },
        });
      }

      // 2. Si no viene token en URL o no se halló, intentar por usuario autenticado
      if (!codeRecord && session?.user) {
        const userId = (session.user as any).id;
        if (userId) {
          codeRecord = await prisma.discountCode.findFirst({
            where: { createdById: userId, category: "AFFILIATE" },
            include: { createdBy: true },
          });
        }
      }
    }
  } catch (err) {
    console.error("Error cargando portal del creador en Neon DB:", err);
  }

  // Si no se encuentra un código de afiliado válido
  if (!codeRecord) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 font-sans">
        <div className="bg-surface rounded-2xl border border-neutral-800 p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              PROGRAMA CREADORES GOSU® TCG
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
              Portal del Afiliado Protegido
            </h1>
            <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
              No se proporcionó un token de acceso válido o tu código de creador aún no está vinculado. Si eres influencer o partner de GOSU®, utiliza el enlace único enviado por el equipo de administración o inicia sesión con tu cuenta de afiliado.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/account/login"
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>INICIAR SESIÓN CON TU CUENTA</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 border border-neutral-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>IR A LA TIENDA</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Cargar órdenes pagadas vinculadas al código del afiliado
  let paidOrders: any[] = [];
  try {
    paidOrders = await prisma.order.findMany({
      where: {
        discountCodeId: codeRecord.id,
        status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
      },
      include: {
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (codeRecord.createdById) {
      commissions = await prisma.commissionLog.findMany({
        where: { affiliateId: codeRecord.createdById },
        include: { order: true },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al obtener órdenes pagadas de afiliado:", err);
  }

  const commissionRate = Number(codeRecord.commissionRate || 10.0);
  const buyerDiscount = Number(codeRecord.value || 10.0);

  let salesPEN = 0;
  let salesUSD = 0;
  let commPEN = 0;
  let commUSD = 0;

  paidOrders.forEach((o: any) => {
    const amt = Number(o.totalAmount || 0);
    const curr = (o.currency || "PEN").toUpperCase();
    const comm = amt * (commissionRate / 100);
    if (curr === "USD") {
      salesUSD += amt;
      commUSD += comm;
    } else {
      salesPEN += amt;
      commPEN += comm;
    }
  });

  const creatorName = codeRecord.createdBy
    ? codeRecord.createdBy.name ||
      `${codeRecord.createdBy.firstName || ""} ${codeRecord.createdBy.lastName || ""}`.trim() ||
      codeRecord.createdBy.email
    : codeRecord.code;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      {/* Cabecera del Creador */}
      <div className="p-6 sm:p-8 bg-surface rounded-2xl border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                PORTAL DEL CREADOR GOSU®
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>CUPÓN ACTIVO ({codeRecord.code})</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              {creatorName}
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Consulta tus métricas de ventas en tiempo real, copia tu enlace de afiliados y revisa tus comisiones.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas de Rendimiento (Dual PEN / USD) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Ventas Totales Generadas */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest block">
            VENTAS TOTALES GENERADAS
          </span>
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-white font-mono block">
              S/. {salesPEN.toFixed(2)} PEN
            </span>
            <span className="text-sm font-bold text-purple-400 font-mono block">
              $ {salesUSD.toFixed(2)} USD
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 block pt-1 font-mono">
            En {paidOrders.length} {paidOrders.length === 1 ? "pedido confirmado" : "pedidos confirmados"}.
          </span>
        </div>

        {/* Tasa de Comisión Creador */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-widest block">
            TASA DE COMISIÓN CREADOR
          </span>
          <span className="text-3xl font-extrabold text-purple-400 font-mono block">
            {commissionRate}%
          </span>
          <span className="text-[11px] text-neutral-500 block pt-1 font-mono">
            Descuento seguidor: {buyerDiscount}% OFF.
          </span>
        </div>

        {/* Comisión Acumulada */}
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 shadow-sm space-y-2">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
            COMISIÓN PENDIENTE POR PAGAR
          </span>
          <div className="space-y-0.5">
            <span className="text-2xl font-black text-emerald-400 font-mono block">
              S/. {commPEN.toFixed(2)} PEN
            </span>
            <span className="text-sm font-bold text-accent-cyan font-mono block">
              $ {commUSD.toFixed(2)} USD
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block pt-1 font-mono">
            Las liquidaciones se procesan automáticamente cada 30 días para saldos mayores a S/. 50.00 PEN (o $ 15.00 USD).
          </span>
        </div>
      </div>

      {/* Formulario de Datos Bancarios BCP / Interbank */}
      <AffiliateBankDetailsForm
        discountCodeId={codeRecord.id}
        userId={codeRecord.createdBy?.id}
        initialBankName={codeRecord.createdBy?.bankName}
        initialAccountNumber={codeRecord.createdBy?.accountNumber}
        initialAccountName={codeRecord.createdBy?.accountName}
        variant="dark"
      />

      {/* Enlaces para Compartir & Acceso al Portal */}
      <div className="space-y-4">
        {/* Enlace Directo de Afiliado para seguidores */}
        <CopyAffiliateLink code={codeRecord.code} variant="shop" />

        {/* Enlace Único de Acceso a este Portal */}
        <CopyCreatorPortalLink token={codeRecord.id} code={codeRecord.code} variant="shop" />
      </div>

      {/* Tabla de Historial de Compras Generadas */}
      <div className="bg-surface rounded-2xl border border-neutral-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-extrabold uppercase text-white tracking-wider font-mono flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-400" />
          <span>Historial de Compras Generadas ({paidOrders.length})</span>
        </h2>

        {paidOrders.length === 0 ? (
          <p className="text-xs text-neutral-400 italic py-6 text-center">
            Aún no se han registrado compras confirmadas utilizando tu código de creador (`{codeRecord.code}`).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-black/60 text-[11px] font-semibold text-neutral-400 uppercase border-b border-neutral-800 font-mono">
                <tr>
                  <th className="px-4 py-3.5">Nº Orden</th>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-4 py-3.5">Comprador</th>
                  <th className="px-4 py-3.5 text-right">Monto Total</th>
                  <th className="px-4 py-3.5 text-right">Comisión Generada ({commissionRate}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                {paidOrders.map((o: any) => {
                  const comm = Number(o.totalAmount || 0) * (commissionRate / 100);
                  const orderCurr = (o.currency || "PEN").toUpperCase();
                  const symbol = orderCurr === "PEN" ? "S/." : "$";

                  return (
                    <tr key={o.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-4 font-mono font-bold text-purple-400">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-4 font-mono text-neutral-400">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-medium text-white max-w-[200px] truncate">
                        {o.user ? o.user.email : o.guestEmail || "Invitado"}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-white">
                        {symbol} {Number(o.totalAmount).toFixed(2)} {orderCurr}
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-extrabold text-emerald-400">
                        +{symbol} {comm.toFixed(2)} {orderCurr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
