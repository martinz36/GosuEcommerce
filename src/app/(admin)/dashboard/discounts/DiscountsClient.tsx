"use client";

import React, { useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  Award,
  Users,
  Percent,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Check,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import {
  createDiscountCodeAction,
  toggleDiscountStatusAction,
  payAffiliateCommissionAction,
  deleteDiscountCodeAction,
} from "./actions";

interface DiscountCode {
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
  commissionRate?: number | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    pendingCommission?: number | null;
    totalSalesGenerated?: number | null;
  } | null;
  orders?: any[];
}

export default function DiscountsClient({
  discountCodes,
  usersList,
}: {
  discountCodes: DiscountCode[];
  usersList: any[];
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [categorySelection, setCategorySelection] = useState<"PROMO" | "AFFILIATE">("PROMO");

  const affiliateCodes = discountCodes.filter((d) => d.category === "AFFILIATE" || d.createdById);
  const promoCodes = discountCodes.filter((d) => d.category !== "AFFILIATE" && !d.createdById);

  return (
    <div className="space-y-8 font-sans">
      {/* Paso 2: Formulario de Creación Avanzado con Acordeón */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Crear Nuevo Código de Descuento o Afiliado</span>
        </h2>

        <form action={createDiscountCodeAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código Promocional *</label>
              <input
                type="text"
                name="code"
                required
                placeholder="Ej: ALEX_TCG"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:bg-white focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Cupón</label>
              <select
                name="type"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED_AMOUNT">Monto Fijo ($)</option>
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
              <select
                name="category"
                value={categorySelection}
                onChange={(e) => setCategorySelection(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
              >
                <option value="PROMO">Promo de Tienda</option>
                <option value="AFFILIATE">Afiliado / Creador TCG</option>
              </select>
            </div>
          </div>

          {/* Opciones de Creador de Contenido (si es Afiliado) */}
          {categorySelection === "AFFILIATE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50/60 border border-purple-100 rounded-xl animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-bold text-purple-900 mb-1">Email del Creador TCG *</label>
                <input
                  type="email"
                  name="userEmail"
                  placeholder="creador@email.com"
                  className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-purple-900 mb-1">% Comisión para el Creador</label>
                <input
                  type="number"
                  step="0.1"
                  name="commissionRate"
                  defaultValue="10.0"
                  placeholder="10.0%"
                  className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold text-purple-700 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Acordeón de Configuración Avanzada (Límite de usos, Mínimo de compra, Fechas) */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontalIcon className="w-4 h-4 text-slate-500" />
                <span>Configuración Avanzada & Reglas de Validez (Opcional)</span>
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
              <span>Guardar Código de Descuento</span>
            </button>
          </div>
        </form>
      </div>

      {/* Paso 3: Dashboard de Métricas en Tiempo Real de Afiliados Creadores */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <span>Red de Creadores & Afiliados TCG ({affiliateCodes.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Métricas de ventas generadas y comisiones acumuladas por creador en tiempo real.
            </p>
          </div>
        </div>

        {affiliateCodes.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4">No hay códigos de afiliados creados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-4 py-3.5">Código</th>
                  <th className="px-4 py-3.5">Creador / Email</th>
                  <th className="px-4 py-3.5">Descuento Comprador</th>
                  <th className="px-4 py-3.5">% Comisión</th>
                  <th className="px-4 py-3.5 text-center">Usos</th>
                  <th className="px-4 py-3.5 text-right">Ventas Generadas ($)</th>
                  <th className="px-4 py-3.5 text-right">Comisión Acumulada ($)</th>
                  <th className="px-4 py-3.5 text-center">Estado (Switch)</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {affiliateCodes.map((c) => {
                  const uses = c.usageCount || (c.orders ? c.orders.length : 0);
                  const totalSalesGenerated = c.orders
                    ? c.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
                    : 0;
                  const commissionRate = Number(c.commissionRate || 10);
                  const calculatedCommission = totalSalesGenerated * (commissionRate / 100);
                  const pendingCommission = c.createdBy?.pendingCommission !== undefined && c.createdBy?.pendingCommission !== null
                    ? Number(c.createdBy.pendingCommission)
                    : calculatedCommission;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      {/* Código */}
                      <td className="px-4 py-4 font-mono font-bold text-xs text-purple-700">
                        {c.code}
                      </td>

                      {/* Creador */}
                      <td className="px-4 py-4 max-w-[180px] truncate">
                        {c.createdBy ? (
                          <div>
                            <span className="font-bold text-slate-900 block truncate">
                              {c.createdBy.name || `${c.createdBy.firstName || ""} ${c.createdBy.lastName || ""}`.trim() || c.createdBy.email}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">{c.createdBy.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No asignado</span>
                        )}
                      </td>

                      {/* Descuento Comprador */}
                      <td className="px-4 py-4 font-mono font-bold text-slate-900">
                        {c.type === "PERCENTAGE" ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`}
                      </td>

                      {/* % Comisión */}
                      <td className="px-4 py-4 font-mono font-bold text-purple-700">
                        {commissionRate}%
                      </td>

                      {/* Usos */}
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-800">
                        {uses}
                      </td>

                      {/* Ventas Generadas ($) */}
                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                        ${totalSalesGenerated.toFixed(2)} USD
                      </td>

                      {/* Comisión Acumulada ($) + Botón Pagar */}
                      <td className="px-4 py-4 text-right font-mono">
                        <span className="font-extrabold text-emerald-600 block">
                          ${pendingCommission.toFixed(2)} USD
                        </span>
                        {pendingCommission > 0 && c.createdBy && (
                          <form action={payAffiliateCommissionAction.bind(null, c.createdBy.id)}>
                            <button
                              type="submit"
                              className="mt-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                              title="Marcar comisión acumulada como pagada"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Marcar Pagado</span>
                            </button>
                          </form>
                        )}
                      </td>

                      {/* Paso 4: Switch Toggle Activo / Inactivo (Soft Delete) */}
                      <td className="px-4 py-4 text-center">
                        <form action={toggleDiscountStatusAction.bind(null, c.id)}>
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

                      {/* Acciones Secundarias (Menú de 3 Puntos para Eliminar) */}
                      <td className="px-4 py-4 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === c.id && (
                            <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 z-20 p-1 font-sans">
                              <form action={deleteDiscountCodeAction.bind(null, c.id)}>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paso 4: Tabla de Cupones Promocionales de Tienda */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-700" />
            <span>Cupones Promocionales Generales ({promoCodes.length})</span>
          </h2>
        </div>

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
                    <form action={toggleDiscountStatusAction.bind(null, c.id)}>
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
                          <form action={deleteDiscountCodeAction.bind(null, c.id)}>
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
      </div>
    </div>
  );
}

function SlidersHorizontalIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="21" x2="14" y1="4" y2="4" />
      <line x1="10" x2="3" y1="4" y2="4" />
      <line x1="21" x2="12" y1="12" y2="12" />
      <line x1="8" x2="3" y1="12" y2="12" />
      <line x1="21" x2="16" y1="20" y2="20" />
      <line x1="12" x2="3" y1="20" y2="20" />
      <line x1="14" x2="14" y1="2" y2="6" />
      <line x1="8" x2="8" y1="10" y2="14" />
      <line x1="16" x2="16" y1="18" y2="22" />
    </svg>
  );
}
