import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  User,
  MapPin,
  CreditCard,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  CheckCheck,
  Send,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  updateOrderStatusAction,
  updateOrderTrackingAction,
  setOrderStatusProcessingAction,
  setOrderStatusShippedAction,
  setOrderStatusDeliveredAction,
  setOrderStatusCancelledAction,
  setOrderStatusRefundedAction,
} from "../actions";

export const revalidate = 0;

interface PageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const orderId = params.id;

  let order: any = null;
  try {
    if (process.env.DATABASE_URL) {
      order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          shippingAddress: true,
          discountCode: true,
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              variant: true,
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("Error buscando detalle de orden:", err);
  }

  if (!order) {
    notFound();
  }

  const shippingInfo = order.shippingAddress || order.shippingAddressJson || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Pagado</span>;
      case "PROCESSING":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">En Preparación</span>;
      case "SHIPPED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Enviado</span>;
      case "DELIVERED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Entregado / Recibido</span>;
      case "PENDING":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Pendiente de Pago</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelado</span>;
      case "REFUNDED":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">Reembolsado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      {/* Botón Volver */}
      <Link
        href="/dashboard/orders"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a la lista de pedidos</span>
      </Link>

      {/* Header Principal de la Orden */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
              {order.orderNumber}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Registrado el {new Date(order.createdAt).toLocaleString()} | ID Interno: {order.id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/account/orders/${order.id}/receipt`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors border border-slate-200"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Imprimir Recibo PDF</span>
          </Link>
        </div>
      </div>

      {/* Grid de 3 Columnas: Cliente, Envío y Estado Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ficha Cliente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Datos del Cliente</h3>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-900">
              {order.user?.name || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || "Cliente Invitado"}
            </p>
            <p className="font-mono text-slate-600">{order.user?.email || order.guestEmail || "Sin email"}</p>
            {order.user?.phone && <p className="text-slate-500 font-mono">Tel: {order.user.phone}</p>}
            <p className="text-slate-400 text-[11px] pt-1">
              Rol de Cuenta: <span className="font-bold text-slate-700">{order.user?.role || "GUEST"}</span>
            </p>
          </div>
        </div>

        {/* Ficha Dirección de Envío */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Dirección de Despacho</h3>
          </div>
          {shippingInfo ? (
            <div className="text-xs space-y-1 text-slate-700 font-sans">
              <p className="font-medium text-slate-900">{shippingInfo.name || shippingInfo.street || "Dirección de Envío"}</p>
              <p>{shippingInfo.address?.line1 || shippingInfo.street}</p>
              {shippingInfo.address?.line2 && <p>{shippingInfo.address.line2}</p>}
              <p className="font-mono">
                {shippingInfo.address?.city || shippingInfo.city}, {shippingInfo.address?.state || shippingInfo.state} {shippingInfo.address?.postal_code || shippingInfo.postalCode}
              </p>
              <p className="font-bold text-slate-900">{shippingInfo.address?.country || shippingInfo.country}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No se especificó dirección de despacho.</p>
          )}
        </div>

        {/* Ficha Pago & Método */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-800">
            <CreditCard className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider">Detalles de Pago</h3>
          </div>
          <div className="text-xs space-y-1.5 font-mono">
            <p className="text-slate-600">
              Pasarela: <span className="font-bold text-slate-900">Stripe Checkout</span>
            </p>
            {order.stripePaymentIntentId && (
              <p className="text-[11px] text-slate-500 truncate" title={order.stripePaymentIntentId}>
                PaymentIntent: <span className="text-slate-800">{order.stripePaymentIntentId}</span>
              </p>
            )}
            <p className="text-slate-900 font-extrabold text-sm pt-1">
              Total: ${Number(order.totalAmount).toFixed(2)} USD
            </p>
          </div>
        </div>
      </div>

      {/* Productos del Pedido (Tabla Detallada) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-700" />
          <span>Desglose de Productos ({order.items.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4 font-bold">Producto</th>
                <th className="py-3 px-4 font-bold">SKU / Variante</th>
                <th className="py-3 px-4 font-bold text-center">Cantidad</th>
                <th className="py-3 px-4 font-bold text-right">Precio Unit.</th>
                <th className="py-3 px-4 font-bold text-right">Total Linea</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {order.items.map((item: any) => {
                const prod = item.product;
                const imgUrl = prod?.images?.[0]?.url || item.variant?.imageUrl || null;

                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                          {imgUrl ? (
                            <img src={imgUrl} alt={prod?.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold block">{prod?.title || "Accesorio TCG"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {item.variant?.sku || prod?.sku || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ${Number(item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ${Number(item.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totales y Desglose Financiero */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-full max-w-xs space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-bold text-slate-900">${Number(order.subtotal).toFixed(2)} USD</span>
            </div>

            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Descuento Cupón:</span>
                <span className="font-bold">-${Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Costo de Envío:</span>
              <span className="font-bold text-slate-900">${Number(order.shippingAmount).toFixed(2)} USD</span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>TOTAL TOTAL:</span>
              <span className="text-blue-600">${Number(order.totalAmount).toFixed(2)} USD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de Logística & Guía de Rastreo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <span>Gestión de Tracking & Estado de Entrega</span>
        </h3>

        <form action={updateOrderTrackingAction.bind(null, order.id)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Código / Número de Guía (Tracking)
            </label>
            <input
              type="text"
              name="trackingNumber"
              defaultValue={order.trackingNumber || ""}
              placeholder="Ej: OLVA-984123, DHL-10293"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL de Rastreo Directa
            </label>
            <input
              type="url"
              name="trackingUrl"
              defaultValue={order.trackingUrl || ""}
              placeholder="https://olvacourier.com/rastreo?id=..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Guardar Guía & Cambiar a Enviado</span>
            </button>
          </div>
        </form>

        {/* Acciones Rápidas de Cambio de Estado */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 font-mono uppercase">Cambio Rápido de Estado:</span>
          
          <form action={setOrderStatusProcessingAction.bind(null, order.id)}>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition-colors">
              Marcar En Preparación
            </button>
          </form>

          <form action={setOrderStatusShippedAction.bind(null, order.id)}>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors">
              Marcar Enviado
            </button>
          </form>

          <form action={setOrderStatusDeliveredAction.bind(null, order.id)}>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar Entregado / Recibido</span>
            </button>
          </form>

          <form action={setOrderStatusCancelledAction.bind(null, order.id)}>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors">
              Marcar Cancelado
            </button>
          </form>

          <form action={setOrderStatusRefundedAction.bind(null, order.id)}>
            <button type="submit" className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-colors">
              Marcar Reembolsado
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
