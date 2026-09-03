import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Printer, ArrowLeft, CheckCircle2, Truck, Package } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PrintReceiptButton } from "./PrintReceiptButton";

export const revalidate = 0;

interface ReceiptPageProps {
  params: {
    id: string;
  };
}

export default async function OrderReceiptPage({ params }: ReceiptPageProps) {
  const { id } = params;

  let order: any = null;
  try {
    if (process.env.DATABASE_URL) {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ id: id }, { orderNumber: id }],
        },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
          discountCode: true,
        },
      });
    }
  } catch (err) {
    console.error("Error al obtener recibo de Neon DB:", err);
  }

  if (!order) {
    notFound();
  }

  const customerName = order.user?.name || order.user?.firstName || order.guestEmail || "Cliente GOSU®";
  const customerEmail = order.user?.email || order.guestEmail || "N/A";

  return (
    <div className="min-h-screen bg-neutral-900 text-slate-900 py-12 px-4 font-body">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Acciones de Navegación e Impresión (No visibles al imprimir) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Mis Compras</span>
          </Link>

          <PrintReceiptButton />
        </div>

        {/* Documento Recibo / Comprobante de Compra */}
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-2xl space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Header del Recibo GOSU® TCG */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8">
            <div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 block">
                GOSU® TCG GEAR
              </span>
              <span className="text-xs text-slate-500 font-mono">Accesorios de Torneo & E-commerce</span>
              <span className="text-xs text-slate-400 block mt-1">RUC/Tax ID: 20601234567 • Lima, Perú</span>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-purple-700 font-bold uppercase tracking-widest block">
                COMPROBANTE DE COMPRA
              </span>
              <span className="text-xl font-mono font-bold text-slate-900 block">
                {order.orderNumber}
              </span>
              <span className="text-xs text-slate-500 font-mono block">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Datos del Cliente y Envío */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">Cliente:</span>
              <span className="font-semibold text-slate-800 block">{customerName}</span>
              <span className="text-slate-500 font-mono block">{customerEmail}</span>
            </div>

            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider block mb-1">Estado de Entrega:</span>
              <span className="font-bold text-emerald-700 uppercase block">{order.status}</span>
              {order.trackingNumber && (
                <span className="text-slate-600 font-mono block mt-0.5">
                  Tracking: <strong>{order.trackingNumber}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Tabla de Productos del Recibo */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3">Descripción</th>
                  <th className="py-3 text-center">Cant.</th>
                  <th className="py-3 text-right">Precio Unit.</th>
                  <th className="py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-3.5 font-semibold text-slate-900">
                      {item.product?.title || "Accesorio GOSU® TCG"}
                    </td>
                    <td className="py-3.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-3.5 text-right font-mono">${Number(item.unitPrice).toFixed(2)} USD</td>
                    <td className="py-3.5 text-right font-mono font-bold">${Number(item.totalPrice).toFixed(2)} USD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desglose Financiero Final */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-1.5 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">${Number(order.subtotal).toFixed(2)} USD</span>
              </div>

              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Descuento:</span>
                  <span>-${Number(order.discountAmount).toFixed(2)} USD</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="font-bold text-slate-900">
                  {Number(order.shippingAmount) === 0 ? "GRATIS" : `$${Number(order.shippingAmount).toFixed(2)} USD`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>TOTAL:</span>
                <span className="text-purple-700 font-extrabold text-base">${Number(order.totalAmount).toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Pie del Documento */}
          <div className="pt-8 border-t border-slate-100 text-center text-[11px] text-slate-400 font-mono">
            <p>Gracias por tu compra en GOSU® TCG Gear. Conserva este comprobante para tu garantía.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
