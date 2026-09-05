"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  TrendingUp,
  Package,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Flame,
} from "lucide-react";
import SalesChart from "./SalesChart";

interface PendingOrder {
  id: string;
  orderNumber: string;
  customerEmail: string;
  totalAmount: number;
  currency: string;
  createdAt: string | Date;
  status: string;
}

interface TopProduct {
  id: string;
  title: string;
  imageUrl?: string | null;
  totalQuantitySold: number;
  revenuePEN: number;
  revenueUSD: number;
  currentStock: number;
}

interface SalesPoint {
  date: string;
  formattedDate: string;
  amountPEN: number;
  amountUSD: number;
}

interface DashboardClientProps {
  salesByCurrency: {
    PEN: { totalSales: number; totalOrders: number; aov: number };
    USD: { totalSales: number; totalOrders: number; aov: number };
  };
  abandonedCartsCount: number;
  chartData: SalesPoint[];
  pendingShippingOrders: PendingOrder[];
  topProducts: TopProduct[];
}

export default function DashboardClient({
  salesByCurrency,
  abandonedCartsCount,
  chartData,
  pendingShippingOrders,
  topProducts,
}: DashboardClientProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<"PEN" | "USD">("PEN");

  const currencySymbol = selectedCurrency === "PEN" ? "S/." : "$";
  const metrics = salesByCurrency[selectedCurrency];

  return (
    <div className="space-y-8 font-body text-slate-900 pb-12">
      {/* Header del Dashboard & Selector Multi-Moneda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <span>Panel Ejecutivo de Analíticas</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Métricas comerciales en tiempo real, KPIs financieros y cola operativa.
          </p>
        </div>

        {/* Tabs Selector Multi-Moneda (PEN vs USD) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedCurrency("PEN")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold font-mono transition-all ${
              selectedCurrency === "PEN"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            S/. Soles (PEN)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCurrency("USD")}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold font-mono transition-all ${
              selectedCurrency === "USD"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            $ Dólares (USD)
          </button>
        </div>
      </div>

      {/* Tarjetas KPI Reales por Moneda */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Ventas Totales */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Ventas Totales ({selectedCurrency})
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div>
            <span className="text-3xl font-black text-slate-900 font-mono block">
              {currencySymbol}
              {metrics.totalSales.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-700 font-semibold block mt-1">
              Ordenes Pagadas en {selectedCurrency}
            </span>
          </div>
        </div>

        {/* 2. Ticket Promedio (AOV) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Ticket Promedio (AOV)
            </span>
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div>
            <span className="text-3xl font-black text-slate-900 font-mono block">
              {currencySymbol}
              {metrics.aov.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-1">
              Gasto promedio por compra
            </span>
          </div>
        </div>

        {/* 3. Pedidos Completados */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Pedidos Pagados
            </span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div>
            <span className="text-3xl font-black text-slate-900 font-mono block">
              {metrics.totalOrders}
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-1">
              Transacciones en {selectedCurrency}
            </span>
          </div>
        </div>

        {/* 4. Carritos Abandonados */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Carritos Abandonados
            </span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>

          <div>
            <span className="text-3xl font-black text-slate-900 font-mono block">
              {abandonedCartsCount}
            </span>
            <Link
              href="/dashboard/abandoned-carts"
              className="text-xs text-amber-700 font-bold hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>Ver sesiones para recuperar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Gráfico de Ventas de los Últimos 30 Días (Recharts) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-700" />
              <span>Evolución de Ventas (Últimos 30 Días)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ingresos diarios consolidados en {selectedCurrency} ({currencySymbol}).
            </p>
          </div>
        </div>

        <SalesChart data={chartData} currency={selectedCurrency} currencySymbol={currencySymbol} />
      </div>

      {/* Listas de Acción Rápida (2 Columnas) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Pedidos Pendientes de Envío */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Pedidos Pendientes de Envío
                </h3>
              </div>

              <Link
                href="/dashboard/orders"
                className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingShippingOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-700">¡Al día! No hay pedidos pendientes de envío.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {pendingShippingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-3.5 flex items-center justify-between text-xs bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          Pagado
                        </span>
                      </div>
                      <span className="text-slate-500 block text-[11px] truncate max-w-[180px]">
                        {order.customerEmail}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <span className="font-bold text-slate-900 block">
                          {order.currency === "PEN" ? "S/." : "$"}
                          {order.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-lg transition-colors shadow-sm shrink-0"
                      >
                        Atender
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Top 5 Productos Más Vendidos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Top 5 Productos Más Vendidos
                </h3>
              </div>

              <Link
                href="/dashboard/products"
                className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Catálogo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-6 text-center">
                Aún no hay suficientes ventas registradas para calcular el ranking de productos.
              </p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, idx) => {
                  const revenue = selectedCurrency === "PEN" ? p.revenuePEN : p.revenueUSD;

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono font-extrabold text-xs text-slate-400 w-4 text-center">
                          #{idx + 1}
                        </span>

                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate leading-tight">
                            {p.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
                            {p.totalQuantitySold} vendidas • Revenue: {currencySymbol}{revenue.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Stock Pill */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border shrink-0 ${
                          p.currentStock > 10
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.currentStock > 0
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        Stock: {p.currentStock}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
