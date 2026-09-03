import React from "react";
import { Tag, Plus, Trash2, Award, Users, Percent, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createDiscountCodeAction, deleteDiscountCodeAction } from "./actions";

export const revalidate = 0;

export default async function AdminDiscountsPage() {
  let discountCodes: any[] = [];
  let usersList: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      discountCodes = await prisma.discountCode.findMany({
        include: {
          createdBy: true,
          orders: true,
        },
        orderBy: { createdAt: "desc" },
      });

      usersList = await prisma.user.findMany({
        select: { id: true, email: true, name: true, firstName: true, lastName: true, role: true },
        orderBy: { email: "asc" },
      });

      // Sembrado automático si no hay códigos
      if (discountCodes.length === 0) {
        await prisma.discountCode.createMany({
          data: [
            { code: "GOSU10", type: "PERCENTAGE", category: "PROMO", value: 10.0, isActive: true },
            { code: "BIENVENIDA", type: "FIXED_AMOUNT", category: "PROMO", value: 5.0, isActive: true },
          ],
        });

        discountCodes = await prisma.discountCode.findMany({
          include: { createdBy: true, orders: true },
        });
      }
    }
  } catch (err) {
    console.error("Error al obtener códigos de descuento de Neon DB:", err);
  }

  const affiliateCodes = discountCodes.filter((d) => d.category === "AFFILIATE" || d.createdById);
  const promoCodes = discountCodes.filter((d) => d.category !== "AFFILIATE" && !d.createdById);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 font-body">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Descuentos & Programa de Afiliados Creadores</h1>
        <p className="text-sm text-slate-500">
          Gestiona cupones promocionales de tienda y asigna códigos de afiliado con comisiones para creadores TCG.
        </p>
      </div>

      {/* Sección 1: Formulario para Crear Nuevo Código (Promo o Afiliado) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-4 h-4 text-slate-500" />
          <span>Crear Nuevo Código de Descuento o Afiliado</span>
        </h2>

        <form action={createDiscountCodeAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Código Promocional *</label>
              <input
                type="text"
                name="code"
                required
                placeholder="Ej: ALEX_TCG"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Cupón</label>
              <select
                name="type"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
              >
                <option value="PERCENTAGE">Porcentaje (%)</option>
                <option value="FIXED_AMOUNT">Monto Fijo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor del Descuento *</label>
              <input
                type="number"
                step="0.01"
                name="value"
                required
                placeholder="Ej: 10 (% o monto)"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                name="category"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
              >
                <option value="PROMO">Promo de Tienda</option>
                <option value="AFFILIATE">Afiliado / Creador TCG</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email del Creador (Opcional)</label>
              <input
                type="email"
                name="userEmail"
                placeholder="creador@email.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">% Comisión para Afiliado</label>
              <input
                type="number"
                step="0.1"
                name="commissionRate"
                defaultValue="10.0"
                placeholder="10.0%"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-purple-700 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Código</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Sección 2: Tabla de Códigos de Afiliados Creadores */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" />
            <span>Red de Creadores & Afiliados TCG ({affiliateCodes.length})</span>
          </h2>
        </div>

        {affiliateCodes.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No hay códigos de afiliados creados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Creador</th>
                  <th className="px-4 py-3">Descuento Comprador</th>
                  <th className="px-4 py-3">% Comisión Creador</th>
                  <th className="px-4 py-3">Ventas Usadas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {affiliateCodes.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-xs text-purple-700">{c.code}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.createdBy ? (
                        <div>
                          <span className="font-semibold text-slate-900 block">{c.createdBy.name || c.createdBy.email}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{c.createdBy.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No asignado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold">
                      {c.type === "PERCENTAGE" ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono font-bold text-emerald-700">
                      {Number(c.commissionRate || 10)}% ganancia
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{c.orders ? c.orders.length : 0} usos</td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteDiscountCodeAction.bind(null, c.id)}>
                        <button type="submit" className="text-slate-400 hover:text-rose-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sección 3: Tabla de Cupones Promocionales de Tienda */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span>Cupones Promocionales Generales ({promoCodes.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descuento</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promoCodes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-xs text-slate-900">{c.code}</td>
                  <td className="px-4 py-3 text-xs font-mono font-bold">
                    {c.type === "PERCENTAGE" ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteDiscountCodeAction.bind(null, c.id)}>
                      <button type="submit" className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
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
