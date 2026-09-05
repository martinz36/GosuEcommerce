"use client";

import React, { useState, useTransition } from "react";
import {
  Truck,
  Plus,
  Edit2,
  MapPin,
  Clock,
  Store,
  CheckCircle2,
  XCircle,
  Globe,
  Sliders,
  ChevronDown,
  X,
  Save,
  Trash2,
} from "lucide-react";
import {
  createRegionShippingMethodAction,
  updateShippingMethodAction,
  toggleShippingMethodActiveAction,
  toggleRegionActiveAction,
  saveLocalPickupAction,
} from "./actions";

const PERU_DEPARTMENTS = [
  "Lima",
  "Arequipa",
  "Cusco",
  "La Libertad",
  "Piura",
  "Lambayeque",
  "Junín",
  "Ancash",
  "Ica",
  "Puno",
  "Tacna",
  "Cajamarca",
  "Ayacucho",
  "Huánuco",
  "Loreto",
  "San Martín",
  "Ucayali",
];

interface ShippingMethodItem {
  id: string;
  name: string;
  cost: number | string;
  freeShippingThreshold?: number | string | null;
  isActive: boolean;
  isPickup: boolean;
  pickupAddress?: string | null;
  pickupSchedule?: string | null;
  targetZones?: any;
}

interface RegionItem {
  id: string;
  countryCode: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number | string;
  isActive: boolean;
  shippingMethods: ShippingMethodItem[];
}

export default function ShippingSettingsClient({ regions }: { regions: RegionItem[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingMethod, setEditingMethod] = useState<ShippingMethodItem | null>(null);

  // States for creation form sub-zones selection per region
  const [selectedZonesForCreate, setSelectedZonesForCreate] = useState<{ [regionId: string]: string[] }>({});
  // States for edit form sub-zones
  const [selectedZonesForEdit, setSelectedZonesForEdit] = useState<string[]>([]);

  // Local Pickup Form State per region
  const [pickupForms, setPickupForms] = useState<{
    [regionId: string]: {
      name: string;
      pickupAddress: string;
      pickupSchedule: string;
      isActive: boolean;
    };
  }>({});

  const handleToggleRegion = (regionId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleRegionActiveAction(regionId, !currentStatus);
    });
  };

  const handleToggleMethod = (methodId: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleShippingMethodActiveAction(methodId, !currentStatus);
    });
  };

  const startEditing = (method: ShippingMethodItem) => {
    setEditingMethod(method);
    let zones: string[] = [];
    if (method.targetZones) {
      if (Array.isArray(method.targetZones)) {
        zones = method.targetZones;
      } else if (typeof method.targetZones === "string") {
        try {
          zones = JSON.parse(method.targetZones);
        } catch {
          zones = [];
        }
      }
    }
    setSelectedZonesForEdit(zones);
  };

  const toggleCreateZone = (regionId: string, dept: string) => {
    const current = selectedZonesForCreate[regionId] || [];
    if (current.includes(dept)) {
      setSelectedZonesForCreate({
        ...selectedZonesForCreate,
        [regionId]: current.filter((d) => d !== dept),
      });
    } else {
      setSelectedZonesForCreate({
        ...selectedZonesForCreate,
        [regionId]: [...current, dept],
      });
    }
  };

  const toggleEditZone = (dept: string) => {
    if (selectedZonesForEdit.includes(dept)) {
      setSelectedZonesForEdit(selectedZonesForEdit.filter((d) => d !== dept));
    } else {
      setSelectedZonesForEdit([...selectedZonesForEdit, dept]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-body text-slate-900">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Configuración Logística y Tarifas de Envío
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona sub-zonas regionales (departamentos), edición de tarifas, recojo en tienda (local pickup) y activación de zonas estilo Shopify.
        </p>
      </div>

      {/* Lista de Regiones */}
      <div className="space-y-8">
        {regions.map((region) => {
          const createZones = selectedZonesForCreate[region.id] || [];
          const pickupMethod = region.shippingMethods.find((m) => m.isPickup);
          const standardMethods = region.shippingMethods.filter((m) => !m.isPickup);

          return (
            <div
              key={region.id}
              className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                region.isActive ? "border-slate-200" : "border-slate-300 bg-slate-50/70"
              }`}
            >
              {/* Header de Región con Toggle Switch */}
              <div className="p-6 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-xl font-mono font-extrabold text-sm tracking-wider text-amber-400 border border-white/10">
                    {region.countryCode}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg flex items-center gap-2 text-white">
                      <span>{region.countryName}</span>
                      <span className="text-xs font-mono font-normal text-slate-400">
                        ({region.currency} • {region.currencySymbol})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Tasa de Cambio: {Number(region.exchangeRate).toFixed(2)} vs USD
                    </p>
                  </div>
                </div>

                {/* Switch de Activación de Región */}
                <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
                  <span className="text-xs font-bold font-mono text-slate-300">
                    {region.isActive ? "REGIÓN ACTIVA" : "REGIÓN DESACTIVADA"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleRegion(region.id, region.isActive)}
                    disabled={isPending}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      region.isActive ? "bg-emerald-500" : "bg-slate-600"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        region.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {!region.isActive && (
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Atención:</strong> Los envíos a esta región están desactivados. Ningún cliente de {region.countryName} podrá seleccionar métodos de envío o finalizar compras.
                  </span>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* 1. Tarifas de Envío Estándar y Sub-zonas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-slate-500" />
                      Tarifas de Envío a Domicilio ({region.currencySymbol})
                    </h3>
                  </div>

                  {standardMethods.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                      No hay tarifas estándar configuradas para esta región.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                      {standardMethods.map((method) => {
                        let targetZonesList: string[] = [];
                        if (method.targetZones) {
                          if (Array.isArray(method.targetZones)) targetZonesList = method.targetZones;
                          else if (typeof method.targetZones === "string") {
                            try {
                              targetZonesList = JSON.parse(method.targetZones);
                            } catch {
                              targetZonesList = [];
                            }
                          }
                        }

                        return (
                          <div
                            key={method.id}
                            className={`p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                              method.isActive ? "bg-white" : "bg-slate-50 opacity-60"
                            }`}
                          >
                            <div className="space-y-1 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-sm text-slate-900">{method.name}</span>
                                {!method.isActive && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                                    Inactiva
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono">
                                <span>
                                  Costo: <strong>{region.currencySymbol}{Number(method.cost).toFixed(2)}</strong>
                                </span>
                                <span>•</span>
                                <span className="text-emerald-700 font-semibold">
                                  {method.freeShippingThreshold
                                    ? `Gratis desde ${region.currencySymbol}${Number(method.freeShippingThreshold).toFixed(2)}`
                                    : "Sin envío gratis"}
                                </span>
                              </div>

                              {/* Badge de Sub-zonas */}
                              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                                <span className="text-[11px] font-medium text-slate-400">Aplica a:</span>
                                {targetZonesList.length === 0 ? (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-semibold border border-slate-200">
                                    Todo el país
                                  </span>
                                ) : (
                                  targetZonesList.map((z) => (
                                    <span
                                      key={z}
                                      className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold border border-blue-200"
                                    >
                                      {z}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Controles de Acción (Editar y Toggle Status) */}
                            <div className="flex items-center gap-3">
                              {/* Toggle Status */}
                              <button
                                type="button"
                                onClick={() => handleToggleMethod(method.id, method.isActive)}
                                className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                                  method.isActive
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                {method.isActive ? "Activa" : "Desactivada"}
                              </button>

                              {/* Botón Editar */}
                              <button
                                type="button"
                                onClick={() => startEditing(method)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 border border-slate-200"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Formulario para Agregar Nueva Tarifa */}
                  <form
                    action={createRegionShippingMethodAction}
                    className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4"
                  >
                    <input type="hidden" name="regionId" value={region.id} />
                    <input
                      type="hidden"
                      name="targetZones"
                      value={JSON.stringify(createZones)}
                    />

                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-slate-600" />
                      <span>Agregar Nueva Tarifa de Envío</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="Nombre ej. Olva Express Lima"
                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="number"
                        step="0.01"
                        name="cost"
                        required
                        placeholder={`Costo (${region.currencySymbol})`}
                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400"
                      />
                      <input
                        type="number"
                        step="0.01"
                        name="freeShippingThreshold"
                        placeholder={`Meta Envío Gratis (${region.currencySymbol})`}
                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400"
                      />
                    </div>

                    {/* Selector de Sub-zonas (Departamentos para Perú) */}
                    {region.countryCode === "PE" && (
                      <div className="space-y-2 pt-2 border-t border-slate-200/80">
                        <span className="text-xs font-bold text-slate-700 block">
                          Aplica a Sub-Zonas (Departamentos de Perú):
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedZonesForCreate({
                                ...selectedZonesForCreate,
                                [region.id]: [],
                              })
                            }
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                              createZones.length === 0
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Todo el país (Perú)
                          </button>
                          {PERU_DEPARTMENTS.map((dept) => {
                            const isSelected = createZones.includes(dept);
                            return (
                              <button
                                key={dept}
                                type="button"
                                onClick={() => toggleCreateZone(region.id, dept)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                                  isSelected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                }`}
                              >
                                {dept}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Guardar Tarifa</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. Bloque Separado para Recojo en Tienda (Local Pickup) */}
                <div className="pt-6 border-t border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-amber-600" />
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Recojo en Tienda (Local Pickup)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Permite a los clientes recoger su pedido en tu tienda o almacén sin costo de envío.
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-[11px] rounded-lg">
                      Costo: S/. 0.00
                    </span>
                  </div>

                  <form
                    action={saveLocalPickupAction}
                    className="p-5 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-4"
                  >
                    <input type="hidden" name="regionId" value={region.id} />
                    {pickupMethod && <input type="hidden" name="methodId" value={pickupMethod.id} />}

                    <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                      <span className="text-xs font-bold text-slate-800">
                        Estado de Recojo en Tienda:
                      </span>

                      <div className="flex items-center gap-2">
                        <input
                          type="hidden"
                          name="isActive"
                          value={
                            pickupForms[region.id]?.isActive !== undefined
                              ? String(pickupForms[region.id].isActive)
                              : String(pickupMethod ? pickupMethod.isActive : false)
                          }
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current =
                              pickupForms[region.id]?.isActive !== undefined
                                ? pickupForms[region.id].isActive
                                : pickupMethod
                                ? pickupMethod.isActive
                                : false;

                            setPickupForms({
                              ...pickupForms,
                              [region.id]: {
                                ...(pickupForms[region.id] || {
                                  name: pickupMethod?.name || "Recojo en Tienda Central",
                                  pickupAddress: pickupMethod?.pickupAddress || "",
                                  pickupSchedule: pickupMethod?.pickupSchedule || "",
                                }),
                                isActive: !current,
                              },
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            (pickupForms[region.id]?.isActive !== undefined
                              ? pickupForms[region.id].isActive
                              : pickupMethod?.isActive)
                              ? "bg-amber-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              (pickupForms[region.id]?.isActive !== undefined
                                ? pickupForms[region.id].isActive
                                : pickupMethod?.isActive)
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-xs font-bold font-mono text-slate-700">
                          {(pickupForms[region.id]?.isActive !== undefined
                          ? pickupForms[region.id].isActive
                          : pickupMethod?.isActive)
                            ? "HABILITADO"
                            : "DESHABILITADO"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Nombre del Punto de Recojo
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={pickupMethod?.name || "Recojo en Tienda Central"}
                          required
                          placeholder="Ej. Recojo en Tienda Miraflores"
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Dirección Completa de Recojo
                        </label>
                        <input
                          type="text"
                          name="pickupAddress"
                          defaultValue={
                            pickupMethod?.pickupAddress || "Av. José Larco 1234, Of. 501, Miraflores, Lima"
                          }
                          required
                          placeholder="Ej. Av. Larco 123, Miraflores"
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Horarios de Atención
                        </label>
                        <input
                          type="text"
                          name="pickupSchedule"
                          defaultValue={
                            pickupMethod?.pickupSchedule || "Lunes a Sábado: 11:00 AM - 7:30 PM"
                          }
                          required
                          placeholder="Ej. Lun - Sáb: 10:00 AM - 7:00 PM"
                          className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-xs font-medium focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Guardar Recojo en Tienda</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edición de Tarifa */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-600" />
                <span>Editar Tarifa de Envío</span>
              </h3>
              <button
                onClick={() => setEditingMethod(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              action={async (formData) => {
                await updateShippingMethodAction(formData);
                setEditingMethod(null);
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editingMethod.id} />
              <input
                type="hidden"
                name="targetZones"
                value={JSON.stringify(selectedZonesForEdit)}
              />

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre de la Tarifa
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMethod.name}
                  required
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Costo de Envío
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="cost"
                    defaultValue={Number(editingMethod.cost)}
                    required
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Meta Envío Gratis (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="freeShippingThreshold"
                    defaultValue={
                      editingMethod.freeShippingThreshold
                        ? Number(editingMethod.freeShippingThreshold)
                        : ""
                    }
                    placeholder="Sin meta"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Selector de Sub-zonas en Edición */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">
                  Aplica a Sub-Zonas (Departamentos):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedZonesForEdit([])}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                      selectedZonesForEdit.length === 0
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Todo el país
                  </button>
                  {PERU_DEPARTMENTS.map((dept) => {
                    const isSelected = selectedZonesForEdit.includes(dept);
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleEditZone(dept)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMethod(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
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
