"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Percent,
  ShoppingCart,
  Store,
  Bell,
  Search,
  Users,
  Truck,
  ShoppingBag,
  Globe,
  Award,
  Mail,
  CreditCard,
  Menu,
  X,
  BookOpen,
  Send,
  ChevronDown,
  ChevronRight,
  Tag,
} from "lucide-react";

interface SubMenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  id: string;
  title: string;
  icon: React.ElementType;
  href?: string;
  items?: SubMenuItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "ventas",
    title: "🛍️ Ventas",
    icon: ShoppingCart,
    items: [
      { name: "Pedidos & Recibos", href: "/dashboard/orders", icon: ShoppingCart },
      { name: "Carritos Abandonados", href: "/dashboard/abandoned-carts", icon: ShoppingBag },
    ],
  },
  {
    id: "catalogo",
    title: "📦 Catálogo",
    icon: Package,
    items: [
      { name: "Productos", href: "/dashboard/products", icon: Package },
      { name: "Categorías", href: "/dashboard/categories", icon: Layers },
    ],
  },
  {
    id: "clientes",
    title: "👥 Clientes",
    icon: Users,
    items: [
      { name: "Directorio de Clientes", href: "/dashboard/customers", icon: Users },
      { name: "GOSU® Loyalty", href: "/dashboard/settings/loyalty", icon: Award },
    ],
  },
  {
    id: "marketing",
    title: "🚀 Marketing",
    icon: Send,
    items: [
      { name: "Cupones y Promociones", href: "/dashboard/promotions", icon: Tag },
      { name: "Programa de Afiliados", href: "/dashboard/affiliates", icon: Award },
      { name: "Novedades & Newsletter", href: "/dashboard/newsletter", icon: Send },
      { name: "Plantillas de Correo", href: "/dashboard/settings/email-templates", icon: Mail },
    ],
  },
  {
    id: "configuracion",
    title: "⚙️ Configuración",
    icon: CreditCard,
    items: [
      { name: "Pasarela de Pago", href: "/dashboard/settings/payments", icon: CreditCard },
      { name: "Configurar Envíos", href: "/dashboard/settings/shipping", icon: Truck },
      { name: "Regiones Multi-Moneda", href: "/dashboard/settings/regions", icon: Globe },
    ],
  },
  {
    id: "soporte",
    title: "⚖️ Soporte & Legal",
    icon: BookOpen,
    items: [
      { name: "Libro de Reclamaciones", href: "/dashboard/claims", icon: BookOpen },
    ],
  },
];

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Helper para verificar si un sub-ítem coincide con la ruta actual
  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Helper para verificar si algún sub-ítem del grupo está activo
  const isGroupActive = (group: NavGroup) => {
    if (group.href) {
      return isItemActive(group.href);
    }
    return group.items?.some((sub) => isItemActive(sub.href)) || false;
  };

  // Estado del acordeón desplegable por categoría
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Auto-expandir grupo al cargar o cambiar de ruta
  useEffect(() => {
    NAVIGATION_GROUPS.forEach((group) => {
      if (group.items && isGroupActive(group)) {
        setOpenGroups((prev) => ({ ...prev, [group.id]: true }));
      }
    });
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const SidebarContent = (
    <div className="flex flex-col justify-between h-full font-body">
      <div className="overflow-y-auto flex-1">
        {/* Header Sidebar */}
        <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gosu-logo-white.png"
              alt="GOSU® Admin"
              className="h-6 w-auto object-contain"
            />
            <span className="font-mono text-[9px] bg-cyan-400 text-black font-extrabold px-1.5 py-0.5 rounded uppercase">
              ADMIN
            </span>
          </div>

          {/* Botón cerrar en móvil */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menú de Navegación Principal (Jerárquico Acordeón) */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Navegación Admin
          </div>

          {NAVIGATION_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const hasSubMenu = Boolean(group.items && group.items.length > 0);
            const groupActive = isGroupActive(group);
            const isOpen = openGroups[group.id] || false;

            // Opción 1: Enlace directo sin submenú (ej. Dashboard)
            if (!hasSubMenu && group.href) {
              const active = isItemActive(group.href);
              return (
                <Link
                  key={group.id}
                  href={group.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <GroupIcon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-500"}`} />
                  <span>{group.title}</span>
                </Link>
              );
            }

            // Opción 2: Categoría con Submenú desplegable (Acordeón)
            return (
              <div key={group.id} className="space-y-1">
                {/* Botón Encabezado de Categoría */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    groupActive
                      ? "bg-indigo-50 text-indigo-900 font-extrabold"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <GroupIcon className={`w-4 h-4 ${groupActive ? "text-indigo-600" : "text-slate-500"}`} />
                    <span>{group.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150" />
                  )}
                </button>

                {/* Submenú Desplegable (Hijos Anidados) */}
                {isOpen && group.items && (
                  <div className="pl-4 space-y-1 border-l-2 border-indigo-100 ml-3.5 my-1">
                    {group.items.map((sub) => {
                      const SubIcon = sub.icon;
                      const subActive = isItemActive(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            subActive
                              ? "bg-slate-900 text-white font-bold shadow-sm"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <SubIcon className={`w-3.5 h-3.5 ${subActive ? "text-cyan-400" : "text-slate-400"}`} />
                            <span>{sub.name}</span>
                          </div>
                          {subActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar - Ir a la tienda pública */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <Link
          href="/"
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
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
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-body antialiased">
      {/* Sidebar Izquierda (Desktop) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {SidebarContent}
      </aside>

      {/* Sidebar Drawer en Celulares (Mobile) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl z-10">
            {SidebarContent}
          </div>
        </div>
      )}

      {/* Área Principal de Trabajo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar / Header Superior */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-10 gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Hamburguesa Móvil */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar productos, órdenes..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-400 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-blue-600 rounded-full absolute top-1.5 right-1.5" />
            </button>

            <div className="h-6 w-px bg-slate-200" />

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
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
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
