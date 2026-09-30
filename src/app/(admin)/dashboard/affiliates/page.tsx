import React from "react";
import { prisma } from "@/lib/prisma";
import AffiliatesClient from "./AffiliatesClient";

export const revalidate = 0;

export default async function AdminAffiliatesPage() {
  let affiliateCodes: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      affiliateCodes = await prisma.discountCode.findMany({
        where: {
          OR: [
            { category: "AFFILIATE" },
            { createdById: { not: null } },
          ],
        },
        include: {
          createdBy: {
            include: {
              payouts: true,
            },
          },
          orders: {
            where: {
              status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al obtener datos de afiliados de Neon DB:", err);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Programa de Afiliados Creadores TCG
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Administra la red de influencers, asigna códigos con la regla preconfigurada 10/10, consulta métricas en tiempo real y envía reportes por correo.
        </p>
      </div>

      <AffiliatesClient affiliateCodes={JSON.parse(JSON.stringify(affiliateCodes))} />
    </div>
  );
}
