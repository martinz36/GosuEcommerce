import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { ArrowLeft, ShoppingBag, CheckCircle2, Clock, Truck, XCircle, FileText, ExternalLink } from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/account/login");
  }

  const userId = (session.user as any).id;

  let userOrders: any[] = [];
  try {
    if (process.env.DATABASE_URL && userId) {
      userOrders = await prisma.order.findMany({
        where: { userId: userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al cargar historial de pedidos en Neon DB:", err);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> Pagado</span>;
      case "SHIPPED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20"><Truck className="w-3.5 h-3.5" /> Enviado</span>;
      case "PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> Pendiente</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"><XCircle className="w-3.5 h-3.5" /> Cancelado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-800 text-neutral-300">{status}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8 font-body">
      <Link
        href="/account/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-accent-cyan transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Mi Cuenta</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-tight text-white">Historial de Compras & Envíos</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Consulta todos tus pedidos procesados, números de seguimiento y recibos imprimibles.
        </p>
      </div>

      <div className="space-y-6">
        {userOrders.length === 0 ? (
          <div className="p-12 bg-surface rounded-2xl border border-neutral-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Aún no has realizado compras</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                Explora el catálogo y realiza tu primer pedido para acumular Puntos de Fidelidad.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 btn-pill bg-white text-black font-bold text-xs hover:bg-accent-cyan transition-colors"
            >
              <span>Explorar Tienda</span>
            </Link>
          </div>
        ) : (
          userOrders.map((order) => (
            <div key={order.id} className="bg-surface rounded-2xl border border-neutral-800 overflow-hidden shadow-lg p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-accent-cyan font-bold block">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">
                    Realizado el {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-white font-mono">
                    ${Number(order.totalAmount).toFixed(2)} USD
                  </span>
                  <Link
                    href={`/account/orders/${order.id}/receipt`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Recibo PDF</span>
                  </Link>
                </div>
              </div>

              {/* Información de Rastreo / Tracking */}
              {order.trackingNumber && (
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <span>Código de Seguimiento: <strong>{order.trackingNumber}</strong></span>
                  </div>

                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent-cyan hover:underline font-bold"
                    >
                      <span>Rastrear Envío</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Lista de Ítems Comprados */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block">
                  Productos del pedido:
                </span>
                <div className="divide-y divide-neutral-800/60 border border-neutral-800 rounded-xl overflow-hidden bg-black/40">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">
                        {item.quantity}x {item.product?.title || "Accesorio TCG"}
                      </span>
                      <span className="font-mono text-neutral-300">
                        ${Number(item.totalPrice).toFixed(2)} USD
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
