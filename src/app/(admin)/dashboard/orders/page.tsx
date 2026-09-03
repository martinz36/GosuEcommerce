import React from "react";
import Link from "next/link";
import { ShoppingBag, Truck, CheckCircle2, Clock, XCircle, FileText, Search, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateOrderStatusAction, updateOrderTrackingAction } from "./actions";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      orders = await prisma.order.findMany({
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
          discountCode: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al obtener pedidos de Neon DB:", err);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Pagado</span>;
      case "SHIPPED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Enviado</span>;
      case "DELIVERED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Entregado</span>;
      case "PENDING":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pendiente</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-body">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Pedidos & Logística de Envíos</h1>
        <p className="text-sm text-slate-500">
          Revisa pedidos procesados, asigna códigos de seguimiento (Tracking Number) y actualiza el estado de entrega.
        </p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No hay pedidos registrados aún</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cuando los clientes completen compras en la tienda, aparecerán listados aquí para su despacho.
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 overflow-hidden">
              {/* Header del Pedido */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    Fecha: {new Date(order.createdAt).toLocaleString()} | Cliente: {order.user?.name || order.guestEmail || "Invitado"} ({order.user?.email || order.guestEmail || "Sin email"})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-900 font-mono">
                    ${Number(order.totalAmount).toFixed(2)} USD
                  </span>
                  <Link
                    href={`/account/orders/${order.id}/receipt`}
                    target="_blank"
                    className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Ver Recibo Imprimible"
                  >
                    <FileText className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Contenido: Ítems del Pedido + Asignación de Tracking */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna 1 y 2: Ítems Comprados */}
                <div className="lg:col-span-2 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Productos en el pedido:</h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden bg-slate-50/50">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900">
                          {item.quantity}x {item.product?.title || "Accesorio TCG"}
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          ${Number(item.totalPrice).toFixed(2)} USD
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Columna 3: Formulario de Tracking & Estado de Logística */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span>Asignar Guía / Tracking</span>
                  </h4>

                  {order.trackingNumber ? (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs space-y-1">
                      <span className="text-[11px] font-mono text-blue-900 font-bold block">
                        CÓDIGO: {order.trackingNumber}
                      </span>
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:underline font-mono block truncate"
                        >
                          Ver rastreo en courier ➔
                        </a>
                      )}
                    </div>
                  ) : null}

                  <form action={updateOrderTrackingAction.bind(null, order.id)} className="space-y-2">
                    <input
                      type="text"
                      name="trackingNumber"
                      required
                      placeholder="Ej: OLVA-984123 o DHL-10293"
                      defaultValue={order.trackingNumber || ""}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                    />
                    <input
                      type="url"
                      name="trackingUrl"
                      placeholder="URL de rastreo (opcional)"
                      defaultValue={order.trackingUrl || ""}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Guardar & Marcar Enviado</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
