import React from "react";
import Link from "next/link";
import { ShoppingCart, FileText, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function OrdersListPage() {
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      include: {
        user: true,
        items: true,
        discountCode: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error cargando órdenes de Neon DB:", err);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Pagado</span>;
      case "SHIPPED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700"><Truck className="w-3 h-3" /> Enviado</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700"><Clock className="w-3 h-3" /> Pendiente</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700"><XCircle className="w-3 h-3" /> Cancelado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Órdenes & Pedidos</h1>
          <p className="text-sm text-slate-500">Listado de compras procesadas por Stripe y registradas en Neon DB.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Aún no hay órdenes registradas</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cuando un cliente complete el checkout en la tienda, su pedido aparecerá automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">N° Orden</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Subtotal</th>
                  <th className="px-6 py-3.5">Descuento</th>
                  <th className="px-6 py-3.5">Total</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{o.orderNumber}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900 block text-xs">
                        {o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}` : "Invitado"}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {o.user?.email || o.guestEmail || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-600">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">${Number(o.subtotal).toFixed(2)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-rose-600 font-semibold">
                      -${Number(o.discountAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">${Number(o.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-xs">{getStatusBadge(o.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => alert(`Recibo de la Orden ${o.orderNumber}\nTotal: $${Number(o.totalAmount).toFixed(2)} USD\nEstado: ${o.status}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Ver Recibo</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
