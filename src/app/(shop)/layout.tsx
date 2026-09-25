import React from "react";
import Link from "next/link";
import { User, LayoutDashboard } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { StoreProvider } from "@/providers/StoreProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { CartButton } from "@/components/CartButton";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeaderSearch } from "@/components/HeaderSearch";
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

        {/* Navbar Público Estilo GOSU® */}
        <header className="sticky top-0 z-50 glass-panel border-b border-surface-muted backdrop-blur-md bg-black/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Logo Brand Oficial (Blanco) */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/gosu-logo-white.png"
                alt="GOSU® TCG GEAR"
                className="h-7 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
            </Link>

            {/* Menú de Navegación Principal */}
            <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-semibold text-neutral-300 shrink-0">
              <a
                href="https://gosuaccessories.com/about-us/es"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Nosotros
              </a>
              <Link
                href="/catalog"
                className="text-accent-cyan font-bold hover:text-white transition-colors"
              >
                Tienda
              </Link>
              <a
                href="https://gosuaccessories.com/stores/es"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Tiendas
              </a>
              <a
                href="https://gosuaccessories.com/become-partner/es"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Vuélvete partner
              </a>
            </nav>

            {/* Buscador Predictivo en Vivo */}
            <div className="flex-1 max-w-[120px] xs:max-w-[180px] sm:max-w-xs">
              <HeaderSearch />
            </div>

            {/* Acciones: Selector de Idioma, Selector de Moneda, Mi Cuenta, Carrito y Panel Admin */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                <LanguageSwitcher />
                <CurrencySwitcher />
              </div>

              {/* Botón Mi Cuenta / Login */}
              <Link
                href={session ? "/account/dashboard" : "/account/login"}
                className="flex items-center gap-1.5 p-2 bg-surface-elevated hover:bg-neutral-800 rounded-full border border-neutral-800 transition-colors text-xs font-semibold"
                title={session ? "Mi Cuenta" : "Iniciar Sesión"}
              >
                <User className="w-4 sm:w-5 h-4 sm:h-5 text-accent-pink" />
                <span className="hidden xl:inline pr-1">
                  {session ? session.user?.name?.split(" ")[0] || "Cuenta" : "Cuenta"}
                </span>
              </Link>

              <Link
                href="/dashboard"
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Admin</span>
              </Link>

              <CartButton />
            </div>
          </div>
        </header>

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
