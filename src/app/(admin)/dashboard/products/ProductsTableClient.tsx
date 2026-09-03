"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Edit,
  FileSpreadsheet,
  Package,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Loader2,
  SlidersHorizontal
} from "lucide-react";
import {
  toggleProductStatusAction,
  quickUpdateStockAction,
  bulkUpdateStockAction,
  bulkToggleStatusAction
} from "./actions";

export interface SerializedProduct {
  id: string;
  title: string;
  sku: string;
  uniqueId?: string | null;
  basePrice: number;
  costPerItem?: number | null;
  stock: number;
  isActive: boolean;
  isFamily: boolean;
  familyId?: string | null;
  productType?: string | null;
  categoryName: string;
  imageUrl?: string | null;
}

export function ProductsTableClient({ initialProducts }: { initialProducts: SerializedProduct[] }) {
  const [products, setProducts] = useState<SerializedProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para modal / ajuste masivo de stock
  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState<number>(100);
  const [bulkStockMode, setBulkStockMode] = useState<"SET" | "ADD">("SET");

  // 1. Filtrado dinámico en tiempo real
  const filteredProducts = products.filter((p) => {
    // Filtro de texto por Nombre, SKU o ID Único
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.uniqueId && p.uniqueId.toLowerCase().includes(query)) ||
      (p.familyId && p.familyId.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    // Filtros por pestaña/estado
    if (filterTab === "ACTIVE") return p.isActive;
    if (filterTab === "INACTIVE") return !p.isActive;
    if (filterTab === "OUT_OF_STOCK") return p.stock <= 0;

    return true;
  });

  // 2. Manejo de selección múltiple (Checkboxes)
  const isAllSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.includes(p.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 3. Acciones de Fila Inmediatas (Toggle estado & ajuste rápido de stock)
  const handleToggleStatus = async (id: string) => {
    setIsProcessing(true);
    // Actualización optimista local
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );

    await toggleProductStatusAction(id);
    setIsProcessing(false);
  };

  const handleStockChange = async (id: string, delta: number) => {
    const target = products.find((p) => p.id === id);
    if (!target) return;

    const newStock = Math.max(0, target.stock + delta);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );

    await quickUpdateStockAction(id, newStock);
  };

  // 4. Acciones Masivas
  const handleBulkToggleStatus = async (targetStatus: boolean) => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);

    setProducts((prev) =>
      prev.map((p) => (selectedIds.includes(p.id) ? { ...p, isActive: targetStatus } : p))
    );

    await bulkToggleStatusAction(selectedIds, targetStatus);
    setSelectedIds([]);
    setIsProcessing(false);
  };

  const handleExecuteBulkStock = async () => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);
    setShowBulkStockModal(false);

    setProducts((prev) =>
      prev.map((p) => {
        if (selectedIds.includes(p.id)) {
          const updatedStock =
            bulkStockMode === "SET"
              ? Math.max(0, bulkStockValue)
              : Math.max(0, p.stock + bulkStockValue);
          return { ...p, stock: updatedStock };
        }
        return p;
      })
    );

    await bulkUpdateStockAction(selectedIds, bulkStockValue, bulkStockMode);
    setSelectedIds([]);
    setIsProcessing(false);
  };

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Búsqueda Avanzada */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Buscador de Texto */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nombre, SKU, ID Único o Familia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
          </div>

          {/* Pestañas de Filtrado */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterTab === "ALL" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterTab === "ACTIVE" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterTab("INACTIVE")}
              className={`px-3 py-1.5 rounded-md transition-colors ${filterTab === "INACTIVE" ? "bg-white text-slate-900 shadow-sm font-bold" : "text-slate-600 hover:text-slate-900"}`}
            >
              Inactivos
            </button>
            <button
              onClick={() => setFilterTab("OUT_OF_STOCK")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${filterTab === "OUT_OF_STOCK" ? "bg-rose-600 text-white font-bold" : "text-rose-600 hover:bg-rose-50"}`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sin Stock ({outOfStockCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barra Flotante de Acciones Masivas cuando hay elementos seleccionados */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-emerald-500 text-black px-2.5 py-0.5 rounded-full font-bold font-mono">
              {selectedIds.length}
            </span>
            <span>productos seleccionados para acción masiva</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBulkStockModal(true)}
              className="px-3 py-1.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
              <span>Ajustar Stock Masivo</span>
            </button>

            <button
              onClick={() => handleBulkToggleStatus(true)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Activar</span>
            </button>

            <button
              onClick={() => handleBulkToggleStatus(false)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors flex items-center gap-1"
            >
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Desactivar</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs underline"
            >
              Desmarcar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 text-base mb-1">No se encontraron productos</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta ajustar el término de búsqueda o cambia la pestaña de filtro.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <button onClick={handleToggleSelectAll} className="text-slate-400 hover:text-slate-700">
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Imagen</th>
                  <th className="px-6 py-3.5">SKU / ID Único</th>
                  <th className="px-6 py-3.5">Producto</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Familia (Variante)</th>
                  <th className="px-6 py-3.5">Precio Base</th>
                  <th className="px-6 py-3.5">Stock (Inventario)</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${isChecked ? "bg-slate-50/80" : ""}`}
                    >
                      {/* Checkbox de Selección */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleSelectOne(p.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Imagen Thumbnail */}
                      <td className="px-4 py-4">
                        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* SKU / ID Único */}
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        {p.sku}
                        {p.uniqueId && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ID: {p.uniqueId}
                          </span>
                        )}
                      </td>

                      {/* Título de Producto */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/products/${p.id}`}
                          className="font-semibold text-slate-900 text-xs hover:text-blue-600 transition-colors block leading-snug"
                        >
                          {p.title}
                        </Link>
                        {p.productType && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {p.productType}
                          </span>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{p.categoryName}</td>

                      {/* Familia / Variante */}
                      <td className="px-6 py-4 text-xs">
                        {p.isFamily ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {p.familyId || "SI"}
                          </span>
                        ) : (
                          <span className="text-slate-400">Único</span>
                        )}
                      </td>

                      {/* Precio Base */}
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        ${p.basePrice.toFixed(2)} USD
                      </td>

                      {/* Stock Interactivo (+ / -) */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStockChange(p.id, -1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Restar 1 al stock"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span
                            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                              p.stock <= 0
                                ? "bg-rose-100 text-rose-700 font-extrabold"
                                : "text-slate-900"
                            }`}
                          >
                            {p.stock} un.
                          </span>

                          <button
                            onClick={() => handleStockChange(p.id, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Sumar 1 al stock"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Estado Interactivo (Activo / Inactivo) */}
                      <td className="px-6 py-4 text-xs">
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition-colors inline-flex items-center gap-1 ${
                            p.isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                          }`}
                        >
                          {p.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{p.isActive ? "Activo" : "Inactivo"}</span>
                        </button>
                      </td>

                      {/* Acciones de Fila */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard/products/${p.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Editar</span>
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

      {/* Modal de Ajuste Masivo de Stock */}
      {showBulkStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Ajustar Stock para {selectedIds.length} Productos
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modo de Actualización
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkStockMode("SET")}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      bulkStockMode === "SET"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Establecer Stock Exacto
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkStockMode("ADD")}
                    className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                      bulkStockMode === "ADD"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    Sumar Unidades al Existente
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {bulkStockMode === "SET" ? "Nuevo Valor de Stock" : "Cantidad a Sumar"}
                </label>
                <input
                  type="number"
                  value={bulkStockValue}
                  onChange={(e) => setBulkStockValue(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowBulkStockModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteBulkStock}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                Confirmar Ajuste Masivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
