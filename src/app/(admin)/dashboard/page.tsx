import React from "react";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export const revalidate = 0;

export default async function DashboardPage() {
  let salesByCurrency = {
    PEN: { totalSales: 0, totalOrders: 0, aov: 0 },
    USD: { totalSales: 0, totalOrders: 0, aov: 0 },
  };

  let abandonedCartsCount = 0;
  let chartData: { date: string; formattedDate: string; amountPEN: number; amountUSD: number }[] = [];
  let pendingShippingOrders: any[] = [];
  let topProducts: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      // 1. Consultar todas las órdenes pagadas
      const paidOrders = await prisma.order.findMany({
        where: { status: "PAID" },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      let totalSalesPEN = 0;
      let countPEN = 0;
      let totalSalesUSD = 0;
      let countUSD = 0;

      // Agrupar ventas por moneda
      paidOrders.forEach((o) => {
        const amount = Number(o.totalAmount);
        const orderNumber = o.orderNumber || "";
        const isPEN = orderNumber.includes("PEN") || amount > 500 || amount % 1 !== 0;
        if (amount > 0) {
          if (isPEN) {
            totalSalesPEN += amount;
            countPEN += 1;
          } else {
            totalSalesUSD += amount;
            countUSD += 1;
          }
        }
      });

      salesByCurrency = {
        PEN: {
          totalSales: totalSalesPEN,
          totalOrders: countPEN,
          aov: countPEN > 0 ? totalSalesPEN / countPEN : 0,
        },
        USD: {
          totalSales: totalSalesUSD,
          totalOrders: countUSD,
          aov: countUSD > 0 ? totalSalesUSD / countUSD : 0,
        },
      };

      // 2. Carritos Abandonados
      abandonedCartsCount = await prisma.cartSession.count({
        where: { isConverted: false },
      });

      // 3. Serie de Tiempo de Ventas (Últimos 30 Días)
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 29);

      const dateMap: { [key: string]: { formattedDate: string; amountPEN: number; amountUSD: number } } = {};
      for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        const formattedDate = d.toLocaleDateString("es-ES", { month: "short", day: "numeric" });
        dateMap[key] = { formattedDate, amountPEN: 0, amountUSD: 0 };
      }

      paidOrders.forEach((o) => {
        const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
        if (dateMap[orderDate]) {
          const amount = Number(o.totalAmount);
          const isPEN = o.orderNumber?.includes("PEN") || amount > 500;
          if (isPEN) {
            dateMap[orderDate].amountPEN += amount;
          } else {
            dateMap[orderDate].amountUSD += amount;
          }
        }
      });

      chartData = Object.keys(dateMap).map((date) => ({
        date,
        formattedDate: dateMap[date].formattedDate,
        amountPEN: Number(dateMap[date].amountPEN.toFixed(2)),
        amountUSD: Number(dateMap[date].amountUSD.toFixed(2)),
      }));

      // 4. Pedidos Pendientes de Envío (últimos 5 pagados sin trackingNumber)
      const pendingOrdersQuery = await prisma.order.findMany({
        where: {
          status: "PAID",
          trackingNumber: null,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      pendingShippingOrders = pendingOrdersQuery.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerEmail: o.guestEmail || "Cliente",
        totalAmount: Number(o.totalAmount),
        currency: Number(o.totalAmount) > 500 ? "PEN" : "USD",
        createdAt: o.createdAt,
        status: o.status,
      }));

      // 5. Top 5 Productos Más Vendidos
      const productMap: {
        [id: string]: {
          id: string;
          title: string;
          imageUrl?: string | null;
          totalQuantitySold: number;
          revenuePEN: number;
          revenueUSD: number;
          currentStock: number;
        };
      } = {};

      paidOrders.forEach((o) => {
        const isPEN = o.orderNumber?.includes("PEN") || Number(o.totalAmount) > 500;
        o.items.forEach((item) => {
          if (item.productId && item.product) {
            const pId = item.productId;
            if (!productMap[pId]) {
              const firstImage =
                item.product.images && item.product.images.length > 0 ? item.product.images[0].url : null;
              productMap[pId] = {
                id: pId,
                title: item.product.title,
                imageUrl: firstImage,
                totalQuantitySold: 0,
                revenuePEN: 0,
                revenueUSD: 0,
                currentStock: item.product.stock,
              };
            }
            productMap[pId].totalQuantitySold += item.quantity;
            const itemRevenue = Number(item.totalPrice);
            if (isPEN) {
              productMap[pId].revenuePEN += itemRevenue;
            } else {
              productMap[pId].revenueUSD += itemRevenue;
            }
          }
        });
      });

      topProducts = Object.values(productMap)
        .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
        .slice(0, 5);
    }
  } catch (err) {
    console.error("Error al cargar analíticas en DashboardPage:", err);
  }

  return (
    <DashboardClient
      salesByCurrency={salesByCurrency}
      abandonedCartsCount={abandonedCartsCount}
      chartData={chartData}
      pendingShippingOrders={pendingShippingOrders}
      topProducts={topProducts}
    />
  );
}
