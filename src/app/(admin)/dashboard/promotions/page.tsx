import React from "react";
import { prisma } from "@/lib/prisma";
import PromotionsClient from "./PromotionsClient";

export const revalidate = 0;

export default async function AdminPromotionsPage() {
  let promoCodes: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      promoCodes = await prisma.discountCode.findMany({
        where: {
          category: { not: "AFFILIATE" },
          createdById: null,
        },
        orderBy: { createdAt: "desc" },
      });

      // Sembrado inicial de cupones promocionales de prueba si estuviera vacío
      if (promoCodes.length === 0) {
        await prisma.discountCode.createMany({
          data: [
            { code: "GOSU10", type: "PERCENTAGE", category: "PROMO", value: 10.0, isActive: true },
            { code: "BIENVENIDA", type: "FIXED_AMOUNT", category: "PROMO", value: 5.0, isActive: true },
          ],
        });

        promoCodes = await prisma.discountCode.findMany({
          where: {
            category: { not: "AFFILIATE" },
            createdById: null,
          },
          orderBy: { createdAt: "desc" },
        });
      }
    }
  } catch (err) {
    console.error("Error al obtener cupones de promoción:", err);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Cupones y Promociones de Tienda
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Crea y gestiona los códigos de descuento generales (porcentaje o monto fijo) para el público general.
        </p>
      </div>

      <PromotionsClient promoCodes={JSON.parse(JSON.stringify(promoCodes))} />
    </div>
  );
}
