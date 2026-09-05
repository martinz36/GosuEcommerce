import React from "react";
import { prisma } from "@/lib/prisma";
import DiscountsClient from "./DiscountsClient";

export const revalidate = 0;

export default async function AdminDiscountsPage() {
  let discountCodes: any[] = [];
  let usersList: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      discountCodes = await prisma.discountCode.findMany({
        include: {
          createdBy: true,
          orders: true,
        },
        orderBy: { createdAt: "desc" },
      });

      usersList = await prisma.user.findMany({
        select: { id: true, email: true, name: true, firstName: true, lastName: true, role: true, pendingCommission: true, totalSalesGenerated: true },
        orderBy: { email: "asc" },
      });

      // Sembrado de cupones iniciales si estuviera vacío
      if (discountCodes.length === 0) {
        await prisma.discountCode.createMany({
          data: [
            { code: "GOSU10", type: "PERCENTAGE", category: "PROMO", value: 10.0, isActive: true },
            { code: "BIENVENIDA", type: "FIXED_AMOUNT", category: "PROMO", value: 5.0, isActive: true },
          ],
        });

        discountCodes = await prisma.discountCode.findMany({
          include: { createdBy: true, orders: true },
        });
      }
    }
  } catch (err) {
    console.error("Error al obtener códigos de descuento de Neon DB:", err);
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Descuentos & Programa de Afiliados Creadores
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gestiona cupones de descuento generales de tienda y asigna códigos de afiliado a creadores TCG con comisiones y métricas en tiempo real.
        </p>
      </div>

      <DiscountsClient
        discountCodes={JSON.parse(JSON.stringify(discountCodes))}
        usersList={JSON.parse(JSON.stringify(usersList))}
      />
    </div>
  );
}
