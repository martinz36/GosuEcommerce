import React from "react";
import { Globe, Plus, DollarSign, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createRegionConfigAction, toggleRegionActiveAction } from "./actions";

export const revalidate = 0;

export default async function RegionsSettingsPage() {
  let regions: any[] = [];
  try {
    regions = await prisma.regionConfig.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Si no existen regiones creadas, agregamos Perú y EE.UU. automáticamente como semilla
    if (regions.length === 0 && process.env.DATABASE_URL) {
      await prisma.regionConfig.createMany({
        data: [
          { countryCode: "PE", countryName: "Perú", currency: "PEN", currencySymbol: "S/.", exchangeRate: 3.75, isActive: true },
          { countryCode: "US", countryName: "Estados Unidos", currency: "USD", currencySymbol: "$", exchangeRate: 1.00, isActive: true },
        ],
        skipDuplicates: true,
      });

      regions = await prisma.regionConfig.findMany({ orderBy: { createdAt: "desc" } });
    }
  } catch (err) {
    console.error("Error al obtener regiones de Neon DB:", err);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Geolocalización & Regiones Multi-Moneda</h1>
        <p className="text-sm text-slate-500">
          Asigna monedas (PEN, USD) y tasas de cambio automáticas según el país detectado por Vercel Geolocation.
        </p>
      </div>

      {/* Formulario de Registro de Región */}
      <form action={createRegionConfigAction} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="w-4 h-4 text-slate-500" />
          <span>+ Configurar Nuevo País o Región</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Código ISO País *</label>
            <input
              type="text text-uppercase"
              name="countryCode"
              required
              placeholder="Ej: PE, US, MX"
              maxLength={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del País *</label>
            <input
              type="text"
              name="countryName"
              required
              placeholder="Ej: Perú, México"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Moneda *</label>
            <select
              name="currency"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            >
              <option value="PEN">PEN (Soles S/.)</option>
              <option value="USD">USD (Dólares $)</option>
              <option value="EUR">EUR (Euros €)</option>
              <option value="MXN">MXN (Pesos Mex $)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Símbolo Visual</label>
            <input
              type="text"
              name="currencySymbol"
              placeholder="Ej: S/. o $"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tasa de Cambio vs USD</label>
            <input
              type="number"
              step="0.0001"
              name="exchangeRate"
              placeholder="3.75 (PEN) o 1.0"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar Región</span>
          </button>
        </div>
      </form>

      {/* Tabla de Regiones Configuradas */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Regiones Registradas en Neon DB</h3>
          <span className="text-xs text-slate-500 font-mono">{regions.length} activas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Código ISO</th>
                <th className="px-6 py-3.5">País</th>
                <th className="px-6 py-3.5">Moneda</th>
                <th className="px-6 py-3.5">Símbolo</th>
                <th className="px-6 py-3.5">Tasa vs USD</th>
                <th className="px-6 py-3.5">Ventas Activas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{r.countryCode}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-xs">{r.countryName}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">{r.currency}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{r.currencySymbol}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-600">{Number(r.exchangeRate).toFixed(2)}</td>
                  <td className="px-6 py-4 text-xs">
                    <form action={toggleRegionActiveAction.bind(null, r.id)}>
                      <button
                        type="submit"
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors ${r.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {r.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{r.isActive ? "Habilitado" : "Deshabilitado"}</span>
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
