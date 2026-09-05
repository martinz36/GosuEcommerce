import React from "react";
import { prisma } from "@/lib/prisma";
import ShippingSettingsClient from "./ShippingSettingsClient";

export const revalidate = 0;

export default async function RegionalShippingSettingsPage() {
  let regions: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      regions = await prisma.regionConfig.findMany({
        include: {
          shippingMethods: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Si no existen regiones creadas, sembramos Perú y EE.UU. automáticamente con métodos de envío por defecto
      if (regions.length === 0) {
        const peRegion = await prisma.regionConfig.create({
          data: { countryCode: "PE", countryName: "Perú", currency: "PEN", currencySymbol: "S/.", exchangeRate: 3.75, isActive: true },
        });
        const usRegion = await prisma.regionConfig.create({
          data: { countryCode: "US", countryName: "Estados Unidos", currency: "USD", currencySymbol: "$", exchangeRate: 1.00, isActive: true },
        });

        await prisma.shippingMethod.createMany({
          data: [
            { regionId: peRegion.id, name: "Envío Estándar Olva Courier", cost: 15.00, freeShippingThreshold: 150.00, isActive: true },
            { regionId: usRegion.id, name: "USPS Ground Advantage", cost: 4.99, freeShippingThreshold: 50.00, isActive: true },
          ],
        });

        regions = await prisma.regionConfig.findMany({
          include: { shippingMethods: true },
          orderBy: { createdAt: "asc" },
        });
      }
    }
  } catch (err) {
    console.error("Error al obtener configuraciones de envío por región de Neon DB:", err);
  }

  const formattedRegions = regions.map((region) => ({
    id: region.id,
    countryCode: region.countryCode,
    countryName: region.countryName,
    currency: region.currency,
    currencySymbol: region.currencySymbol,
    exchangeRate: Number(region.exchangeRate),
    isActive: region.isActive,
    shippingMethods: region.shippingMethods.map((m: any) => ({
      id: m.id,
      name: m.name,
      cost: Number(m.cost),
      freeShippingThreshold: m.freeShippingThreshold ? Number(m.freeShippingThreshold) : null,
      isActive: m.isActive,
      isPickup: m.isPickup,
      pickupAddress: m.pickupAddress,
      pickupSchedule: m.pickupSchedule,
      targetZones: m.targetZones,
    })),
  }));

  return <ShippingSettingsClient regions={formattedRegions} />;
}
