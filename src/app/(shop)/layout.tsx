import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth/next";
import { LayoutDashboard, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { StoreProvider } from "@/providers/StoreProvider";
import { CartButton } from "@/components/CartButton";
import { CartDrawer } from "@/components/CartDrawer";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { HeaderSearch } from "@/components/HeaderSearch";

export const revalidate = 0;

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // 1. Leer cookies geolocalizadas generadas por Middleware
  const cookieStore = cookies();
  const userCountry = cookieStore.get("user-country")?.value || "PE";
  const userCurrencyPref = cookieStore.get("user-currency")?.value;

  // 2. Valores por defecto para la región
  let storeSettings = {
    freeShippingThreshold: userCountry === "PE" ? 150.00 : 50.00,
    standardShippingCost: userCountry === "PE" ? 15.00 : 4.99,
    currency: userCurrencyPref || (userCountry === "PE" ? "PEN" : "USD"),
    currencySymbol: userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref) ? "S/." : "$",
    exchangeRate: userCurrencyPref === "PEN" || (userCountry === "PE" && !userCurrencyPref) ? 3.75 : 1.00,
    countryCode: userCountry,
    shippingMethods: [] as any[],
  };

  // 3. Consultar Neon DB (RegionConfig & ShippingMethods de esa región específica)
  try {
    if (process.env.DATABASE_URL) {
      const region = await prisma.regionConfig.findUnique({
        where: { countryCode: userCountry },
        include: {
          shippingMethods: {
            where: { isActive: true },
            orderBy: { cost: "asc" },
          },
        },
      });

      if (region && region.isActive) {
        if (!userCurrencyPref) {
          storeSettings.currency = region.currency;
          storeSettings.currencySymbol = region.currencySymbol;
          storeSettings.exchangeRate = Number(region.exchangeRate);
        }

        if (region.shippingMethods.length > 0) {
          const firstMethod = region.shippingMethods[0];
          storeSettings.standardShippingCost = Number(firstMethod.cost);
          if (firstMethod.freeShippingThreshold) {
            storeSettings.freeShippingThreshold = Number(firstMethod.freeShippingThreshold);
          }

          storeSettings.shippingMethods = region.shippingMethods.map((m) => ({
            id: m.id,
            name: m.name,
            cost: Number(m.cost),
            freeShippingThreshold: m.freeShippingThreshold ? Number(m.freeShippingThreshold) : null,
          }));
        }
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
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
            {/* Logo Brand */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-accent-cyan to-accent-pink bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                GOSU®
              </span>
              <span className="hidden sm:inline-block text-[10px] bg-surface-elevated border border-neutral-700 px-2 py-0.5 rounded-full text-accent-cyan font-mono tracking-widest uppercase">
                TCG GEAR
              </span>
            </Link>

            {/* Buscador Predictivo en Vivo */}
            <div className="flex-1 max-w-sm">
              <HeaderSearch />
            </div>

            {/* Acciones: Selector de Moneda, Mi Cuenta, Carrito y Panel Admin */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <CurrencySwitcher />

              {/* Botón Mi Cuenta / Login */}
              <Link
                href={session ? "/account/dashboard" : "/account/login"}
                className="flex items-center gap-2 p-2 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors text-xs font-semibold"
                title={session ? "Mi Cuenta" : "Iniciar Sesión"}
              >
                <User className="w-5 h-5 text-accent-pink" />
                <span className="hidden lg:inline pr-1">
                  {session ? session.user?.name?.split(" ")[0] || "Cuenta" : "Cuenta"}
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-elevated hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold transition-colors"
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
              <Link href="/account/dashboard" className="hover:text-accent-cyan transition-colors">
                Mi Cuenta
              </Link>
              <span>•</span>
              <Link href="/dashboard" className="hover:text-accent-cyan transition-colors">
                Panel Admin
              </Link>
              <span>•</span>
              <span className="text-neutral-600">Región: {storeSettings.countryCode} ({storeSettings.currency})</span>
            </div>
          </div>
        </footer>
      </div>
    </StoreProvider>
  );
}
