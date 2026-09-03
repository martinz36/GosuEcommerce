import React from "react";
import { Tag, Plus, Percent, DollarSign, Users, Calendar, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createDiscountCodeAction } from "./actions";

export const revalidate = 0;

export default async function DiscountsPage() {
  let discountCodes: any[] = [];
  try {
    discountCodes = await prisma.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error al cargar cupones de Neon DB:", err);
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Códigos de Descuento & Afiliados</h1>
        <p className="text-sm text-slate-500">
          Crea cupones promocionales de porcentaje, monto fijo o códigos de creadores con comisión.
        </p>
      </div>

      {/* Formulario de Creación de Descuentos */}
      <form action={createDiscountCodeAction} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span>+ Crear Nuevo Código de Descuento</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Código *</label>
            <input
              type="text"
              name="code"
              required
              placeholder="Ej: GOSU20 o ALEX_TCG"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Descuento *</label>
            <select
              name="type"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            >
              <option value="PERCENTAGE">Porcentaje (%)</option>
              <option value="FIXED_AMOUNT">Monto Fijo ($ USD)</option>
              <option value="FREE_SHIPPING">Envío Gratuito</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Valor * (% o $)</label>
            <input
              type="number"
              step="0.01"
              name="value"
              required
              placeholder="10 o 5.00"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
            <select
              name="category"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            >
              <option value="PROMO">Promo / Tienda</option>
              <option value="AFFILIATE">Afiliado / Creador</option>
              <option value="REFERRAL">Referido</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Compra Mínima ($ USD)</label>
            <input
              type="number"
              step="0.01"
              name="minPurchaseAmount"
              placeholder="0.00 (Opcional)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Límite de Usos Globales</label>
            <input
              type="number"
              name="usageLimit"
              placeholder="100 (Opcional)"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fecha de Expiración</label>
            <input
              type="date"
              name="expiresAt"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar Código de Descuento</span>
          </button>
        </div>
      </form>

      {/* Tabla de Códigos de Descuento Registrados */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Códigos Activos en Neon DB</h3>
          <span className="text-xs text-slate-500 font-mono">{discountCodes.length} registrados</span>
        </div>

        {discountCodes.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Aún no hay códigos creados en la base de datos. Usa el formulario para agregar tu primer cupón.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Tipo & Valor</th>
                  <th className="px-6 py-3">Categoría</th>
                  <th className="px-6 py-3">Compra Mínima</th>
                  <th className="px-6 py-3">Usos</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discountCodes.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{d.code}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-800">
                      {d.type === "PERCENTAGE" ? `${Number(d.value)}% OFF` : `$${Number(d.value).toFixed(2)} USD OFF`}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {d.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {d.minPurchaseAmount ? `$${Number(d.minPurchaseAmount).toFixed(2)}` : "Sin mínimo"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">
                      {d.usageCount} / {d.usageLimit || "∞"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-semibold ${d.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {d.isActive ? "Activo" : "Inactivo"}
                      </span>
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
