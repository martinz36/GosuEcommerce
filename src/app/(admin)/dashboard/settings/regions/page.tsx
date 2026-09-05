import React from "react";
import { prisma } from "@/lib/prisma";
import RegionsClient from "./RegionsClient";

export const revalidate = 0;

export default async function RegionsSettingsPage() {
  let regions: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      regions = await prisma.regionConfig.findMany({
        orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      });

      // Si no existen regiones creadas, agregamos Perú y EE.UU. automáticamente como semilla
      if (regions.length === 0) {
        await prisma.regionConfig.createMany({
          data: [
            { countryCode: "PE", countryName: "Perú", currency: "PEN", currencySymbol: "S/.", exchangeRate: 3.75, isActive: true, isDefault: false },
            { countryCode: "US", countryName: "Estados Unidos", currency: "USD", currencySymbol: "$", exchangeRate: 1.00, isActive: true, isDefault: true },
          ],
          skipDuplicates: true,
        });

        regions = await prisma.regionConfig.findMany({
          orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
        });
      }
    }
  } catch (err) {
    console.error("Error al obtener regiones de Neon DB:", err);
  }

  const formattedRegions = regions.map((r) => ({
    id: r.id,
    countryCode: r.countryCode,
    countryName: r.countryName,
    currency: r.currency,
    currencySymbol: r.currencySymbol,
    exchangeRate: Number(r.exchangeRate),
    isActive: r.isActive,
    isDefault: r.isDefault,
    isAutoExchangeRate: r.isAutoExchangeRate,
  }));

  return <RegionsClient regions={formattedRegions} />;
}
