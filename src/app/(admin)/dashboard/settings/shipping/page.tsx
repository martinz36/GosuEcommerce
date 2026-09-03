import React from "react";
import { Truck, Gift, Plus, Trash2, Globe, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createRegionShippingMethodAction, deleteShippingMethodAction } from "./actions";

export const revalidate = 0;

export default async function RegionalShippingSettingsPage() {
  let regions: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      regions = await prisma.regionConfig.findMany({
        where: { isActive: true },
        include: {
          shippingMethods: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      // Si no existen regiones creadas, sembramos Perú y EE.UU. automáticamente con métodos de envío por defecto
      if (regions.length === 0) {
        const peRegion = await prisma.regionConfig.create({
          data: { countryCode: "PE", countryName: "Perú", currency: "PEN", currencySymbol: "S/.", exchangeRate: 3.75, isActive: true },
        });
        const usRegion = await prisma.regionConfig.create({
          data: { countryCode: "US", countryName: "Estados Unidos", currency: "USD", currencySymbol: "$", exchangeRate: 1.00, isActive: true },
        });

        await prisma.shippingMethod.createMany({
          data: [
            { regionId: peRegion.id, name: "Envío Estándar Olva Courier", cost: 15.00, freeShippingThreshold: 150.00, isActive: true },
            { regionId: usRegion.id, name: "USPS Ground Advantage", cost: 4.99, freeShippingThreshold: 50.00, isActive: true },
          ],
        });

        regions = await prisma.regionConfig.findMany({
          where: { isActive: true },
          include: { shippingMethods: true },
        });
      }
    }
  } catch (err) {
    console.error("Error al obtener configuraciones de envío por región de Neon DB:", err);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-body">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración de Envíos por Zona y Región</h1>
        <p className="text-sm text-slate-500">
          Establece tarifas de envío y metas de envío gratuito dinámicas en la moneda local de cada país.
        </p>
      </div>

      {/* Lista de Regiones Configuradas */}
      <div className="space-y-6">
        {regions.map((region) => (
          <div key={region.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
            {/* Header de la Región */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700 font-mono font-bold text-xs">
                  {region.countryCode}
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <span>{region.countryName}</span>
                    <span className="text-xs font-mono font-normal text-slate-500">({region.currency} {region.currencySymbol})</span>
                  </h2>
                  <p className="text-xs text-slate-500">Tasa de Cambio: {Number(region.exchangeRate).toFixed(2)} vs USD</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Región Activa
              </span>
            </div>

            {/* Métodos de Envío Existentes en esta Región */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tarifas Configuradas en {region.currencySymbol}</h3>

              {region.shippingMethods.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay métodos de envío configurados para esta región.</p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                  {region.shippingMethods.map((m: any) => (
                    <div key={m.id} className="p-3.5 flex items-center justify-between text-xs bg-slate-50/50">
                      <div>
                        <span className="font-bold text-slate-900 block">{m.name}</span>
                        <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px] mt-0.5">
                          <span>Costo: {region.currencySymbol}{Number(m.cost).toFixed(2)}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">
                            {m.freeShippingThreshold ? `Gratis desde ${region.currencySymbol}${Number(m.freeShippingThreshold).toFixed(2)}` : "Sin envío gratis"}
                          </span>
                        </div>
                      </div>

                      <form action={deleteShippingMethodAction.bind(null, m.id)}>
                        <button
                          type="submit"
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Eliminar tarifa de envío"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulario para Agregar Nuevo Método de Envío en esta Región */}
            <form action={createRegionShippingMethodAction} className="pt-4 border-t border-slate-100 space-y-3">
              <input type="hidden" name="regionId" value={region.id} />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>Agregar Nuevo Método para {region.countryName}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej. Envío Estándar (3-5 días)"
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
                />
                <input
                  type="number"
                  step="0.01"
                  name="cost"
                  required
                  placeholder={`Costo (${region.currencySymbol})`}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                />
                <input
                  type="number"
                  step="0.01"
                  name="freeShippingThreshold"
                  placeholder={`Meta Envío Gratis (${region.currencySymbol})`}
                  className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Guardar Tarifa en {region.currency}</span>
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
