import React from "react";
import { prisma } from "@/lib/prisma";
import OrdersTableClient from "./OrdersTableClient";

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Gestión de Pedidos & Logística de Envíos
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Consulta y gestiona las órdenes de compra. Haz clic en el número de orden para ver el desglose completo, actualiza estados y asigna guías de envío.
        </p>
      </div>

      <OrdersTableClient initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
