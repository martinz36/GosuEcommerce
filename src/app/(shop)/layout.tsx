import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { StoreProvider } from "@/providers/StoreProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Navbar } from "@/components/Navbar";
import { MainFooter } from "@/components/MainFooter";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Valores predeterminados seguros para StoreSettings
  let storeSettings = {
    freeShippingThreshold: 50.0,
    standardShippingCost: 4.99,
    countryCode: "PE",
    currency: "PEN",
    currencySymbol: "S/.",
    exchangeRate: 3.75,
    isRegionActive: true,
    shippingMethods: [] as any[],
    language: "es",
    dictionary: undefined as any,
  };

  try {
    if (process.env.DATABASE_URL) {
      const defaultRegion = await prisma.regionConfig.findFirst({
        where: { isDefault: true, isActive: true },
        include: { shippingMethods: { where: { isActive: true } } },
      });
      if (defaultRegion) {
        storeSettings = {
          ...storeSettings,
          countryCode: defaultRegion.countryCode,
          currency: defaultRegion.currency,
          currencySymbol: defaultRegion.currencySymbol,
          exchangeRate: Number(defaultRegion.exchangeRate),
          shippingMethods: defaultRegion.shippingMethods.map((m) => ({
            id: m.id,
            name: m.name,
            cost: Number(m.cost),
            freeShippingThreshold: m.freeShippingThreshold ? Number(m.freeShippingThreshold) : null,
            isPickup: m.isPickup,
            pickupAddress: m.pickupAddress,
            pickupSchedule: m.pickupSchedule,
            targetZones: m.targetZones,
          })),
        };
      }
    }
  } catch (err) {
    console.error("Error al consultar RegionConfig de Neon DB:", err);
  }

  return (
    <StoreProvider settings={storeSettings}>
      <div className="min-h-screen bg-black text-white font-body selection:bg-accent-cyan selection:text-black flex flex-col justify-between">
        {/* Drawer del Carrito Global */}
        <CartDrawer />

        {/* Navbar Premium de Dos Niveles (Announcement Bar + Main Header) */}
        <Navbar />

        {/* Contenido de la Tienda */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer Unificado con Mapa del Sitio y Newsletter */}
        <MainFooter countryCode={storeSettings.countryCode} currency={storeSettings.currency} />
      </div>
    </StoreProvider>
  );
}
