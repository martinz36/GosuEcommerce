import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { LayoutDashboard } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StoreProvider } from "@/providers/StoreProvider";
import { CartButton } from "@/components/CartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

export const revalidate = 0;

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Leer cookies geolocalizadas generadas por Middleware
  const cookieStore = cookies();
  const userCountry = cookieStore.get("user-country")?.value || "PE";
  const userCurrencyPref = cookieStore.get("user-currency")?.value;

  // 2. Valores por defecto
  let storeSettings = {
    freeShippingThreshold: 50.00,
    standardShippingCost: 4.99,
    currency: userCurrencyPref || (userCountry === "PE" ? "PEN" : "USD"),
    currencySymbol: userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref) ? "S/." : "$",
    exchangeRate: userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref) ? 3.75 : 1.00,
    countryCode: userCountry,
  };

  // 3. Consultar Neon DB (StoreSettings & RegionConfig)
  try {
    if (process.env.DATABASE_URL) {
      const dbSettings = await prisma.storeSettings.findUnique({
        where: { id: "default" },
      });
      if (dbSettings) {
        storeSettings.freeShippingThreshold = Number(dbSettings.freeShippingThreshold);
        storeSettings.standardShippingCost = Number(dbSettings.standardShippingCost);
      }

      // Buscar configuración regional específica
      const region = await prisma.regionConfig.findUnique({
        where: { countryCode: userCountry },
      });

      if (region && region.isActive && !userCurrencyPref) {
        storeSettings.currency = region.currency;
        storeSettings.currencySymbol = region.currencySymbol;
        storeSettings.exchangeRate = Number(region.exchangeRate);
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

        {/* Navbar Público Estilo Framer / GOSU® */}
        <header className="sticky top-0 z-50 glass-panel border-b border-surface-muted backdrop-blur-md bg-black/80">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-accent-cyan to-accent-pink bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                GOSU®
              </span>
              <span className="text-[10px] bg-surface-elevated border border-neutral-700 px-2 py-0.5 rounded-full text-accent-cyan font-mono tracking-widest uppercase">
                TCG GEAR
              </span>
            </Link>

            {/* Enlaces de Categorías */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="hover:text-accent-cyan transition-colors">
                Inicio
              </Link>
              <Link href="/#catalog" className="hover:text-accent-cyan transition-colors">
                Catálogo
              </Link>
              <Link href="/#bundles" className="hover:text-accent-pink transition-colors">
                Packs & Bundles
              </Link>
              <Link href="/#affiliates" className="hover:text-accent-yellow transition-colors">
                Afiliados
              </Link>
            </nav>

            {/* Acciones: Selector de Moneda, Carrito y Panel Admin */}
            <div className="flex items-center gap-3">
              <CurrencySwitcher />

              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Admin</span>
              </Link>

              <CartButton />
            </div>
          </div>
        </header>

        {/* Contenido de la Tienda */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-surface-muted text-center text-xs text-neutral-500 bg-black">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 GOSU® Premium TCG Accessories. Impulsado por Next.js App Router, Neon DB & Stripe.</p>
            <div className="flex items-center gap-4 text-neutral-400">
              <Link href="/dashboard" className="hover:text-accent-cyan transition-colors">
                Panel Admin
              </Link>
              <span>•</span>
              <span className="text-neutral-600">Region: {storeSettings.countryCode} ({storeSettings.currency})</span>
            </div>
          </div>
        </footer>
      </div>
    </StoreProvider>
  );
}
