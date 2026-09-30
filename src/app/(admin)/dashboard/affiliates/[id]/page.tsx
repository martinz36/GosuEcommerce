import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CopyAffiliateLink } from "@/components/CopyAffiliateLink";
import {
  ArrowLeft,
  Award,
  DollarSign,
  Users,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Package,
} from "lucide-react";

export const revalidate = 0;

export default async function AdminAffiliateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  let codeRecord: any = null;
  let creatorCommissions: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      codeRecord = await prisma.discountCode.findUnique({
        where: { id },
        include: {
          createdBy: true,
          orders: {
            include: {
              user: true,
              items: {
                include: { product: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!codeRecord && id) {
        // También intentar por userId del creador
        codeRecord = await prisma.discountCode.findFirst({
          where: { createdById: id },
          include: {
            createdBy: true,
            orders: {
              include: {
                user: true,
                items: {
                  include: { product: true },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        });
      }

      if (codeRecord && codeRecord.createdBy) {
        creatorCommissions = await prisma.commissionLog.findMany({
          where: { affiliateId: codeRecord.createdBy.id },
          include: { order: true },
          orderBy: { createdAt: "desc" },
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar detalles del afiliado:", err);
  }

  if (!codeRecord) {
    notFound();
  }

  const creator = codeRecord.createdBy;
  const orders = codeRecord.orders || [];
  const commissionRate = Number(codeRecord.commissionRate || 10.0);

  let salesPEN = 0;
  let salesUSD = 0;
  let commPEN = 0;
  let commUSD = 0;

  orders.forEach((o: any) => {
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Botón Volver */}
      <Link
        href="/dashboard/affiliates"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la Red de Afiliados</span>
      </Link>

      {/* Cabecera del Creador */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 uppercase">
                PORTAL DEL AFILIADO (VISTA ADMIN)
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {creator ? (creator.name || `${creator.firstName || ""} ${creator.lastName || ""}`.trim() || creator.email) : "Creador TCG"}
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Email: {creator?.email || "Sin email"} | Código: <strong className="text-purple-700">{codeRecord.code}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border ${codeRecord.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
            {codeRecord.isActive ? "CUPÓN ACTIVO" : "INACTIVO"}
          </span>
        </div>
      </div>

      {/* Generador y Copiador de Enlace Directo (?ref=CODIGO) */}
      <CopyAffiliateLink code={codeRecord.code} variant="admin" />

      {/* Tarjetas de Métricas de Rendimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider block">
            VENTAS TOTALES GENERADAS
          </span>
          <div className="space-y-0.5">
            <span className="text-xl font-extrabold text-slate-900 font-mono block">
              S/. {salesPEN.toFixed(2)} PEN
            </span>
            <span className="text-sm font-semibold text-indigo-600 font-mono block">
              $ {salesUSD.toFixed(2)} USD
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono block pt-1">
            En {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} registrados.
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-mono font-bold text-purple-600 uppercase tracking-wider block">
            TASA DE COMISIÓN CREADOR
          </span>
          <span className="text-2xl font-extrabold text-purple-700 font-mono block">
            {commissionRate}%
          </span>
          <span className="text-[11px] text-slate-400 block">
            Descuento comprador: {Number(codeRecord.value)}% OFF.
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider block">
            COMISIÓN PENDIENTE POR PAGAR
          </span>
          <div className="space-y-0.5">
            <span className="text-xl font-extrabold text-emerald-600 font-mono block">
              S/. {commPEN.toFixed(2)} PEN
            </span>
            <span className="text-sm font-semibold text-indigo-600 font-mono block">
              $ {commUSD.toFixed(2)} USD
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">
            Saldo acumulado por liquidar al influencer.
          </span>
        </div>
      </div>

      {/* Tabla de Órdenes Generadas por el Código del Afiliado */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-600" />
          <span>Historial de Compras Generadas con el Código ({orders.length})</span>
        </h3>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">Aún no se han registrado compras utilizando este código.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-4 py-3">Nº Orden</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Comprador</th>
                  <th className="px-4 py-3 text-right">Monto Total</th>
                  <th className="px-4 py-3 text-right">Comisión Generada ({commissionRate}%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((o: any) => {
                  const comm = Number(o.totalAmount || 0) * (commissionRate / 100);
                  const orderCurr = (o.currency || "PEN").toUpperCase();
                  const symbol = orderCurr === "PEN" ? "S/." : "$";

                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                        {o.orderNumber}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {new Date(o.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {o.user ? o.user.email : o.guestEmail || "Invitado"}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                        {symbol} {Number(o.totalAmount).toFixed(2)} {orderCurr}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-600">
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
