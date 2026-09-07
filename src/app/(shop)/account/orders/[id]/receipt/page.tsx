import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles, Download } from "lucide-react";
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
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              loyaltyPoints: true,
              defaultShippingAddress: true,
            },
          },
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

  let shipObj: any = null;
  if (order.shippingAddressJson) {
    try {
      shipObj =
        typeof order.shippingAddressJson === "string"
          ? JSON.parse(order.shippingAddressJson)
          : order.shippingAddressJson;
    } catch (e) {}
  }

  const customerName =
    order.user?.name ||
    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
    order.guestEmail ||
    "Cliente GOSU®";
  const customerEmail = order.user?.email || order.guestEmail || "No especificado";
  const customerPhone = order.user?.phone || shipObj?.phone || "No especificado";

  const street = shipObj?.street || shipObj?.line1 || order.user?.defaultShippingAddress || "Dirección no especificada";
  const city = shipObj?.city || "";
  const state = shipObj?.state || "";
  const postalCode = shipObj?.postalCode || shipObj?.postal_code || "";
  const country = shipObj?.country || "PE";
  const fullAddressDisplay = [street, city, state, postalCode, country].filter(Boolean).join(", ");

  const maskedPaymentMethod = order.stripePaymentIntentId
    ? `Tarjeta Stripe (PI: ****${order.stripePaymentIntentId.slice(-6)})`
    : "Pago en Línea Confirmado";

  const currencyCode = (order.currency || "PEN").toUpperCase();
  const currencySymbol = currencyCode === "PEN" ? "S/." : "$";

  const totalAmount = Number(order.totalAmount || 0);
  const subtotalAmount = Number(order.subtotal || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const shippingAmount = Number(order.shippingAmount || 0);

  const pointsEarned = Math.floor(totalAmount);

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

          <div className="flex items-center gap-3">
            <a
              href={`/api/orders/${order.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Abrir PDF Completo</span>
            </a>
            <PrintReceiptButton />
          </div>
        </div>

        {/* Documento Recibo / Packing Slip */}
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-2xl space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Header del Recibo GOSU® TCG */}
          <div className="flex justify-between items-start border-b border-slate-900 pb-8">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/de4so8h01/image/upload/v1784049362/GosuLogo_wletc3.png"
                alt="GOSU® TCG GEAR"
                className="h-10 w-auto object-contain"
              />
              <div>
                <span className="text-xs text-slate-500 font-mono block">Accesorios de Torneo & E-commerce</span>
                <span className="text-xs text-slate-400 block font-mono">soporte@gosu.com • Lima, Perú</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-purple-700 font-bold uppercase tracking-widest block">
                PACKING SLIP / RECIBO
              </span>
              <span className="text-xl font-mono font-bold text-slate-900 block">
                {order.orderNumber}
              </span>
              <span className="text-xs text-slate-500 font-mono block">
                {new Date(order.createdAt).toLocaleString("es-PE", { timeZone: "America/Lima" })}
              </span>
            </div>
          </div>

          {/* Cuadrícula Dual de Tablas: Facturación & Cliente vs Dirección de Envío */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1">
                📋 Facturación & Cliente
              </span>
              <div className="space-y-1">
                <p><strong className="text-slate-700">Cliente:</strong> <span className="font-semibold text-slate-900">{customerName}</span></p>
                <p><strong className="text-slate-700">Email:</strong> <span className="font-mono text-slate-900">{customerEmail}</span></p>
                <p><strong className="text-slate-700">Teléfono:</strong> <span className="font-mono text-slate-900">{customerPhone}</span></p>
                <p><strong className="text-slate-700">Pago:</strong> <span className="text-slate-900 font-medium">{maskedPaymentMethod}</span></p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-200 pb-1">
                📦 Dirección de Envío (Packing)
              </span>
              <div className="space-y-1">
                <p><strong className="text-slate-700">Entrega:</strong> <span className="font-medium text-slate-900">{fullAddressDisplay}</span></p>
                <p><strong className="text-slate-700">Estado:</strong> <span className="font-bold text-emerald-700 uppercase">{order.status}</span></p>
                {order.trackingNumber && (
                  <p><strong className="text-slate-700">Tracking:</strong> <span className="font-mono text-slate-900">{order.trackingNumber}</span></p>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de Productos Packing List */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase font-semibold">
                  <th className="py-3 px-4">Descripción del Producto</th>
                  <th className="py-3 px-4 text-center">Cant.</th>
                  <th className="py-3 px-4 text-right">Precio Unit.</th>
                  <th className="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item: any) => (
                  <tr key={item.id} className="odd:bg-white even:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.product?.title || "Accesorio GOSU® TCG"}
                      {item.product?.sku && (
                        <span className="block text-[10px] text-slate-400 font-mono">SKU: {item.product.sku}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{item.quantity}</td>
                    <td className="py-3.5 px-4 text-right font-mono">{currencySymbol} {Number(item.unitPrice).toFixed(2)} {currencyCode}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">{currencySymbol} {Number(item.totalPrice).toFixed(2)} {currencyCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Desglose Financiero Final */}
          <div className="flex justify-end pt-2">
            <div className="w-72 space-y-1.5 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-900">{currencySymbol} {subtotalAmount.toFixed(2)} {currencyCode}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Descuento:</span>
                  <span>-{currencySymbol} {discountAmount.toFixed(2)} {currencyCode}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="font-bold text-slate-900">
                  {shippingAmount === 0 ? "GRATIS" : `${currencySymbol} ${shippingAmount.toFixed(2)} ${currencyCode}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t-2 border-slate-900">
                <span>TOTAL:</span>
                <span className="text-purple-700 font-extrabold text-base">{currencySymbol} {totalAmount.toFixed(2)} {currencyCode}</span>
              </div>
            </div>
          </div>

          {/* Banner Dinámico GOSU Loyalty */}
          <div className="p-4 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl text-center">
            <p className="text-xs md:text-sm font-extrabold text-purple-900 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>✨ GOSU Loyalty: ¡Has ganado +{pointsEarned} puntos con esta compra!</span>
            </p>
          </div>

          {/* Pie del Documento */}
          <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 font-mono">
            <p>Gracias por tu compra en GOSU® TCG Gear • Conserva este comprobante Packing Slip para tu garantía.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
