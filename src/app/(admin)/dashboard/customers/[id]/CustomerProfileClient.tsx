"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Award,
  Crown,
  Sparkles,
  Zap,
  ShoppingBag,
  CreditCard,
  DollarSign,
  TrendingUp,
  SlidersHorizontal,
  X,
  Check,
  RefreshCw,
  Eye,
  FileText,
  Calendar,
} from "lucide-react";
import { adjustCustomerPointsAction } from "../actions";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    title: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string | Date;
  status: string;
  totalAmount: number;
  items: OrderItem[];
}

interface Customer {
  id: string;
  name?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  role: string;
  loyaltyPoints: number;
  createdAt: string | Date;
  orders: Order[];
}

export default function CustomerProfileClient({ customer }: { customer: Customer }) {
  const [points, setPoints] = useState(customer.loyaltyPoints);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayName = customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Cliente Registrado";
  const totalOrders = customer.orders.length;
  const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Determinar Nivel GOSU Loyalty
  const getLoyaltyTier = (pts: number) => {
    if (pts >= 2000)
      return {
        name: "GOSU Champion",
        badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
        icon: Crown,
        min: 2000,
        next: "Nivel Máximo Alcanzado 🏆",
      };
    if (pts >= 500)
      return {
        name: "Meta Player",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Sparkles,
        min: 500,
        next: `${2000 - pts} pts para GOSU Champion`,
      };
    return {
      name: "Contender",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Zap,
      min: 0,
      next: `${500 - pts} pts para Meta Player`,
    };
  };

  const tier = getLoyaltyTier(points);
  const TierIcon = tier.icon;

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newPoints = Math.max(0, points + pointsDelta);
    setPoints(newPoints);
    setShowPointsModal(false);

    const res = await adjustCustomerPointsAction(customer.id, pointsDelta);
    if (!res.success) {
      alert(res.error || "Error al actualizar los puntos.");
      setPoints(customer.loyaltyPoints);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 font-sans">
      {/* Enlace de Regreso */}
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Directorio de Clientes</span>
      </Link>

      {/* Header del Perfil del Cliente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center font-mono shrink-0 shadow-md">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{displayName}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tier.badge}`}>
                <TierIcon className="w-3.5 h-3.5" />
                <span>{tier.name}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {customer.email} | Registrado el {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Botón Paso 2: Ajustar Puntos */}
        <button
          onClick={() => setShowPointsModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Award className="w-4 h-4" />
          <span>Ajustar Puntos ({points} pts)</span>
        </button>
      </div>

      {/* Métrica Resumen Financiero & Loyalty */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Gastado</span>
          <span className="text-2xl font-black text-slate-900 font-mono">${totalSpent.toFixed(2)} USD</span>
          <span className="text-[11px] text-slate-500 block font-mono">En compras procesadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Órdenes</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalOrders}</span>
          <span className="text-[11px] text-slate-500 block font-mono">Compras completadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Promedio</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">${averageTicket.toFixed(2)} USD</span>
          <span className="text-[11px] text-slate-500 block font-mono">Promedio por orden</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nivel GOSU Loyalty</span>
          <span className="text-xl font-extrabold text-purple-700 font-mono flex items-center gap-1.5 pt-1">
            <TierIcon className="w-5 h-5 text-purple-600" />
            <span>{tier.name}</span>
          </span>
          <span className="text-[11px] text-purple-600 block font-medium pt-0.5">{tier.next}</span>
        </div>
      </div>

      {/* Historial de Órdenes del Cliente (Mini-tabla) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-slate-700" />
          <span>Historial de Pedidos del Cliente ({totalOrders})</span>
        </h3>

        {totalOrders === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">Este cliente aún no ha realizado compras.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Nº Orden</th>
                  <th className="py-3 px-4 font-bold">Fecha</th>
                  <th className="py-3 px-4 font-bold">Estado</th>
                  <th className="py-3 px-4 font-bold text-center">Productos</th>
                  <th className="py-3 px-4 font-bold text-right">Total</th>
                  <th className="py-3 px-4 font-bold text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customer.orders.map((o) => {
                  const itemCount = o.items ? o.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        <Link href={`/dashboard/orders/${o.id}`} className="hover:text-blue-600 underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                            o.status === "PAID" || o.status === "DELIVERED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : o.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono">{itemCount} items</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${Number(o.totalAmount).toFixed(2)} USD
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/orders/${o.id}`}
                          className="p-1.5 text-slate-500 hover:text-slate-900 inline-block"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Paso 2: Ajuste Manual de Puntos */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-base">
                <Award className="w-5 h-5" />
                <h3>Ajustar Puntos GOSU Loyalty</h3>
              </div>
              <button
                onClick={() => setShowPointsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <p className="font-semibold text-purple-900">Saldo Actual del Cliente:</p>
                <p className="text-xl font-black text-purple-700 font-mono">{points} pts</p>
                <p className="text-[11px] text-purple-800">
                  Nivel actual: <strong>{tier.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad de Puntos a Ajustar *
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Usa números positivos para acreditar puntos (ej: <code>50</code>) o negativos para restar (ej: <code>-20</code>).
                </p>
                <input
                  type="number"
                  required
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPointsModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Guardar Nuevo Saldo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
