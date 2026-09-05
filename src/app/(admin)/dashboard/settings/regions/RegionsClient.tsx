"use client";

import React, { useState, useTransition } from "react";
import {
  Globe,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Star,
  Zap,
  Save,
  X,
  RefreshCw,
  Lock,
} from "lucide-react";
import {
  createRegionConfigAction,
  updateRegionConfigAction,
  toggleRegionActiveAction,
  setDefaultRegionAction,
} from "./actions";

interface RegionItem {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number | string;
  isActive: boolean;
  isDefault: boolean;
  isAutoExchangeRate: boolean;
}

export default function RegionsClient({ regions }: { regions: RegionItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingRegion, setEditingRegion] = useState<RegionItem | null>(null);

  // States for creation form auto-exchange-rate toggle
  const [createAutoRate, setCreateAutoRate] = useState(false);
  const [createIsDefault, setCreateIsDefault] = useState(false);

  // States for edit form auto-exchange-rate toggle
  const [editAutoRate, setEditAutoRate] = useState(false);
  const [editIsDefault, setEditIsDefault] = useState(false);

  const startEditing = (r: RegionItem) => {
    setEditingRegion(r);
    setEditAutoRate(r.isAutoExchangeRate);
    setEditIsDefault(r.isDefault);
  };

  const handleToggleActive = (id: string) => {
    startTransition(async () => {
      await toggleRegionActiveAction(id);
    });
  };

  const handleSetDefault = (id: string) => {
    startTransition(async () => {
      await setDefaultRegionAction(id);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-body text-slate-900">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Globe className="w-7 h-7 text-slate-700" />
          <span>Geolocalización & Regiones Multi-Moneda (Shopify Markets)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configura monedas locales, tasas de cambio y la región por defecto para el Resto del Mundo (evita pantallas en blanco).
        </p>
      </div>

      {/* Formulario para Registrar Nueva Región */}
      <form
        action={async (formData) => {
          await createRegionConfigAction(formData);
          setCreateAutoRate(false);
          setCreateIsDefault(false);
        }}
        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
      >
        <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-4 h-4 text-slate-600" />
          <span>Configurar Nuevo País o Región</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Código ISO País *</label>
            <input
              type="text"
              name="countryCode"
              required
              placeholder="Ej: PE, US, MX"
              maxLength={2}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nombre del País *</label>
            <input
              type="text"
              name="countryName"
              required
              placeholder="Ej: Perú, México"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Moneda *</label>
            <select
              name="currency"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white"
            >
              <option value="PEN">PEN (Soles S/.)</option>
              <option value="USD">USD (Dólares $)</option>
              <option value="EUR">EUR (Euros €)</option>
              <option value="MXN">MXN (Pesos Mex $)</option>
              <option value="CLP">CLP (Pesos Chil $)</option>
              <option value="COP">COP (Pesos Col $)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Símbolo Visual</label>
            <input
              type="text"
              name="currencySymbol"
              placeholder="Ej: S/. o $"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tasa de Cambio vs USD {createAutoRate && "(Auto)"}
            </label>
            <input
              type="number"
              step="0.0001"
              name="exchangeRate"
              disabled={createAutoRate}
              defaultValue={1.0}
              placeholder="3.75 o 1.0"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white disabled:opacity-50"
            />
          </div>
        </div>

        {/* Toggles de Configuración Avanzada en Creación */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <input type="hidden" name="isDefault" value={String(createIsDefault)} />
            <button
              type="button"
              onClick={() => setCreateIsDefault(!createIsDefault)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                createIsDefault ? "bg-amber-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  createIsDefault ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="font-bold text-slate-700">Región por Defecto (Rest of World)</span>
          </div>

          <div className="flex items-center gap-2">
            <input type="hidden" name="isAutoExchangeRate" value={String(createAutoRate)} />
            <button
              type="button"
              onClick={() => setCreateAutoRate(!createAutoRate)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                createAutoRate ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  createAutoRate ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className="font-bold text-slate-700">Tasa Automática (API ExchangeRate)</span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Guardar Región</span>
          </button>
        </div>
      </form>

      {/* Tabla de Regiones Registradas */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Regiones Configuradas en Neon DB</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">{regions.length} regiones</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Código ISO</th>
                <th className="px-6 py-3.5">País / Nombre</th>
                <th className="px-6 py-3.5">Moneda</th>
                <th className="px-6 py-3.5">Tasa vs USD</th>
                <th className="px-6 py-3.5">Estado (Ventas)</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {regions.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-slate-900 p-2 bg-slate-100 rounded-lg text-xs">
                        {r.countryCode}
                      </span>
                      {r.isDefault && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Default (Rest of World)
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                    {r.countryName}
                  </td>

                  <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-800">
                    {r.currency} ({r.currencySymbol})
                  </td>

                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                    <span>{Number(r.exchangeRate).toFixed(4)}</span>
                    {r.isAutoExchangeRate && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-200">
                        Auto API
                      </span>
                    )}
                  </td>

                  {/* Switch Interactivo en Tabla */}
                  <td className="px-6 py-4 text-xs">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(r.id)}
                        disabled={isPending}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          r.isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            r.isActive ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className={`font-bold text-[11px] ${r.isActive ? "text-emerald-700" : "text-slate-500"}`}>
                        {r.isActive ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </div>
                  </td>

                  {/* Columna Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!r.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(r.id)}
                          disabled={isPending}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-lg transition-colors border border-amber-200 flex items-center gap-1"
                          title="Marcar como región por defecto (Rest of World)"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hacer Default</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => startEditing(r)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 border border-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edición de Región */}
      {editingRegion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Editar Región ({editingRegion.countryCode})</span>
              </h3>
              <button
                onClick={() => setEditingRegion(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateRegionConfigAction(formData);
                setEditingRegion(null);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editingRegion.id} />
              <input type="hidden" name="isActive" value={String(editingRegion.isActive)} />
              <input type="hidden" name="isDefault" value={String(editIsDefault)} />
              <input type="hidden" name="isAutoExchangeRate" value={String(editAutoRate)} />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del País
                </label>
                <input
                  type="text"
                  name="countryName"
                  defaultValue={editingRegion.countryName}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Moneda (ISO)
                  </label>
                  <input
                    type="text"
                    name="currency"
                    defaultValue={editingRegion.currency}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Símbolo Visual
                  </label>
                  <input
                    type="text"
                    name="currencySymbol"
                    defaultValue={editingRegion.currencySymbol}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Tasa de Cambio vs USD</span>
                  {editAutoRate && (
                    <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Tasa Automática Bloqueada
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="exchangeRate"
                  defaultValue={Number(editingRegion.exchangeRate)}
                  disabled={editAutoRate}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-400 disabled:opacity-50 disabled:bg-slate-100"
                />
              </div>

              {/* Toggles en Modal */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Región por Defecto (Rest of World)</span>
                  <button
                    type="button"
                    onClick={() => setEditIsDefault(!editIsDefault)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      editIsDefault ? "bg-amber-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        editIsDefault ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800">Tasa Dinámica Automática</span>
                  <button
                    type="button"
                    onClick={() => setEditAutoRate(!editAutoRate)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      editAutoRate ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        editAutoRate ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRegion(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
