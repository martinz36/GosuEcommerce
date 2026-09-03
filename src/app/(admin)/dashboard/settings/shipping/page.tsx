import React from "react";
import Link from "next/link";
import { Truck, DollarSign, Gift, Plus, Save, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateStoreSettingsAction, createShippingMethodAction } from "./actions";

export const revalidate = 0;

export default async function ShippingSettingsPage() {
  let settings = null;
  let shippingMethods: any[] = [];

  try {
    settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    shippingMethods = await prisma.shippingMethod.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error al cargar StoreSettings de Neon DB:", err);
  }

  const freeShippingThreshold = settings ? Number(settings.freeShippingThreshold) : 50.00;
  const standardShippingCost = settings ? Number(settings.standardShippingCost) : 4.99;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración de Envíos</h1>
        <p className="text-sm text-slate-500">
          Gestiona las tarifas de envío estándar y la meta de compra para el envío gratuito.
        </p>
      </div>

      {/* Formulario 1: Tarifas Globales */}
      <form action={updateStoreSettingsAction} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Reglas Generales de Envío</h2>
              <p className="text-xs text-slate-500">Valores aplicados dinámicamente en el carrito y checkout.</p>
            </div>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-md shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Costo de Envío Estándar ($ USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.01"
                name="standardShippingCost"
                defaultValue={standardShippingCost}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tarifa base para pedidos menores a la meta gratuita.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meta para Envío Gratuito ($ USD)
            </label>
            <div className="relative">
              <Gift className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.01"
                name="freeShippingThreshold"
                defaultValue={freeShippingThreshold}
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Monto mínimo en carrito para activar `Envío $0.00`.</p>
          </div>
        </div>
      </form>

      {/* Métodos de Envío Específicos */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="font-bold text-sm text-slate-900">Métodos de Envío Configurados</h2>

        {shippingMethods.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No hay métodos de envío adicionales. Se aplica la tarifa general.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {shippingMethods.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900 block">{m.name}</span>
                  <span className="text-slate-500 font-mono">${Number(m.cost).toFixed(2)} USD</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                  Activo
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Formulario Agregar Nuevo Método */}
        <form action={createShippingMethodAction} className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">+ Agregar Método de Envío</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre (ej. Envío Express 24h)"
              required
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            />
            <input
              type="number"
              step="0.01"
              name="cost"
              placeholder="Costo ($ USD)"
              required
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Método</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
