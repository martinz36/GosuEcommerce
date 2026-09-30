"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import {
  createPromoCodeAction,
  togglePromoStatusAction,
  deletePromoCodeAction,
} from "./actions";

interface PromoCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  category: "PROMO" | "REFERRAL" | "AFFILIATE";
  value: number;
  minPurchaseAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}

export default function PromotionsClient({ promoCodes }: { promoCodes: PromoCode[] }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="space-y-8 font-sans">
      {/* Formulario de Creación Exclusivo para Cupones Promocionales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-4 h-4 text-indigo-600" />
          <span>Crear Nuevo Código de Descuento Promocional</span>
        </h2>

        <form action={createPromoCodeAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código Promocional *</label>
              <input
                type="text"
                name="code"
                required
                placeholder="Ej: BIENVENIDA10"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:bg-white focus:border-indigo-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Descuento</label>
              <select
                name="type"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED_AMOUNT">Monto Fijo ($ USD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Valor del Descuento *</label>
              <input
                type="number"
                step="0.01"
                name="value"
                required
                placeholder="Ej: 10 (% o $ USD)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Acordeón de Reglas Avanzadas */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span>Reglas de Expiración y Mínimo de Compra (Opcional)</span>
              </div>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Límite de Usos Máximos</label>
                  <input
                    type="number"
                    name="usageLimit"
                    placeholder="Ej: 100 (vacío = ilimitado)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gasto Mínimo Requerido ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="minPurchaseAmount"
                    placeholder="Ej: 50.00 USD"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Expiración</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Cupón Promocional</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de Cupones Promocionales Generales */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-indigo-600" />
            <span>Cupones Promocionales Generales ({promoCodes.length})</span>
          </h2>
        </div>

        {promoCodes.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No hay cupones promocionales registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-4 py-3.5">Código</th>
                  <th className="px-4 py-3.5">Descuento</th>
                  <th className="px-4 py-3.5">Reglas / Expiración</th>
                  <th className="px-4 py-3.5 text-center">Usos / Límite</th>
                  <th className="px-4 py-3.5 text-center">Estado (Switch)</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {promoCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-mono font-bold text-xs text-slate-900">{c.code}</td>
                    <td className="px-4 py-4 font-mono font-bold text-slate-900">
                      {c.type === "PERCENTAGE" ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`}
                    </td>
                    <td className="px-4 py-4 text-xs font-mono text-slate-500">
                      {c.minPurchaseAmount ? `Mín: $${Number(c.minPurchaseAmount)} USD` : "Sin mínimo"}
                      {c.endDate && <span className="block text-[10px] text-slate-400">Exp: {new Date(c.endDate).toLocaleDateString()}</span>}
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold">
                      {c.usageCount || 0} / {c.usageLimit ? c.usageLimit : "∞"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <form action={togglePromoStatusAction.bind(null, c.id)}>
                        <button
                          type="submit"
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            c.isActive ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={c.isActive ? "Desactivar cupón" : "Activar cupón"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              c.isActive ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === c.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 z-20 p-1 font-sans">
                            <form action={deletePromoCodeAction.bind(null, c.id)}>
                              <button
                                type="submit"
                                className="w-full px-3 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar Reg.</span>
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
