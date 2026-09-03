import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Boxes,
  Percent,
  ShoppingCart,
  Settings,
  Store,
  Bell,
  Search,
  UserCheck
} from "lucide-react";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Productos", href: "/dashboard/products", icon: Package },
    { name: "Packs & Bundles", href: "/dashboard/bundles", icon: Boxes },
    { name: "Descuentos & Afiliados", href: "/dashboard/discounts", icon: Percent },
    { name: "Pedidos", href: "/dashboard/orders", icon: ShoppingCart },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-body antialiased">
      {/* Sidebar Izquierda - SaaS Minimalista */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          {/* Header Sidebar */}
          <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm tracking-tight">
                G
              </div>
              <div>
                <span className="font-bold text-sm text-slate-900 block leading-tight">
                  GOSU Admin
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  Shopify Engine
                </span>
              </div>
            </div>
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Gestión de Tienda
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar - Ir a la tienda pública */}
        <div className="p-4 border-t border-slate-200">
          <Link
            href="/"
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-md text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-slate-500" />
              <span>Ver Tienda Pública</span>
            </div>
            <span className="text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-500 font-mono">
              Live ↗
            </span>
          </Link>
        </div>
      </aside>

      {/* Área Principal de Trabajo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar / Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar productos, órdenes, afiliados..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1.5 right-1.5" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                AD
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-semibold text-slate-800 block leading-tight">
                  Administrador
                </span>
                <span className="text-[11px] text-slate-500 block leading-tight">
                  admin@gosu.com
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico del Dashboard */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
