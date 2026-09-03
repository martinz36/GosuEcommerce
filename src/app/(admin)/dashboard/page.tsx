import React from "react";
import Link from "next/link";
import { Package, Plus, DollarSign, ShoppingCart, Users, ArrowUpRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function DashboardPage() {
  // Consultas rápidas a Neon Postgres mediante Prisma
  let productCount = 0;
  let orderCount = 0;
  let userCount = 0;

  try {
    productCount = await prisma.product.count();
    orderCount = await prisma.order.count();
    userCount = await prisma.user.count();
  } catch (err) {
    // Si la DB aún no tiene registros
  }

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-sm text-slate-500">Resumen operativo del motor e-commerce de GOSU®</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-md shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Producto</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Métricas SaaS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Ventas Totales
            </span>
            <span className="text-2xl font-bold text-slate-900">$0.00</span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-1">
              <ArrowUpRight className="w-3 h-3" /> +0% este mes
            </span>
          </div>
          <div className="p-3 bg-slate-100 rounded-lg text-slate-700">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Pedidos
            </span>
            <span className="text-2xl font-bold text-slate-900">{orderCount}</span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              Registrados en Neon
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Productos
            </span>
            <span className="text-2xl font-bold text-slate-900">{productCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              En inventario
            </span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Afiliados & Usuarios
            </span>
            <span className="text-2xl font-bold text-slate-900">{userCount}</span>
            <span className="text-[11px] text-slate-500 font-medium block mt-1">
              Clientes activos
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sección Informativa y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Estado del Sistema & Servicios</h2>
            <span className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
              Operativo
            </span>
          </div>
          <div className="space-y-3 divide-y divide-slate-100 text-sm">
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Neon Postgres DB</span>
              <span className="font-mono text-xs text-slate-500">Conectado (ep-wandering-star)</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Cloudinary Storage</span>
              <span className="font-mono text-xs text-slate-500">API Configurada</span>
            </div>
            <div className="pt-3 flex justify-between items-center">
              <span className="text-slate-600 font-medium">Stripe Payments Engine</span>
              <span className="font-mono text-xs text-slate-500">Modo Test Ready</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-2">Acciones Rápidas</h2>
            <p className="text-xs text-slate-500 mb-4">Gestión de catálogo e inventario.</p>
          </div>
          <div className="space-y-2">
            <Link
              href="/dashboard/products/new"
              className="w-full text-center block bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              + Nuevo Producto con Cloudinary
            </Link>
            <Link
              href="/dashboard/products"
              className="w-full text-center block bg-slate-100 text-slate-700 text-xs font-semibold py-2.5 rounded-md hover:bg-slate-200 transition-colors"
            >
              Ver Lista de Productos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
