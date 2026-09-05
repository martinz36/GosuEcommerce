"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Edit,
  Package,
  Layers,
  Image as ImageIcon,
  CheckSquare,
  Square,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Check,
  X,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  toggleProductStatusAction,
  quickUpdateStockAction,
  quickUpdatePriceAction,
  bulkUpdateProductsAction,
  bulkUpdateStockAction,
} from "./actions";

export interface SerializedProduct {
  id: string;
  title: string;
  sku: string;
  uniqueId?: string | null;
  priceUSD: number;
  pricePEN: number;
  costUSD?: number | null;
  costPEN?: number | null;
  basePrice?: number;
  costPerItem?: number | null;
  stock: number;
  isActive: boolean;
  isFamily: boolean;
  familyId?: string | null;
  productType?: string | null;
  categoryName: string;
  imageUrl?: string | null;
}

export function ProductsTableClient({
  initialProducts,
  currentSort = "",
}: {
  initialProducts: SerializedProduct[];
  currentSort?: string;
}) {
  const router = useRouter();
  const [products, setProducts] = useState<SerializedProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK">("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para Modal de Confirmación de Eliminación Masiva
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estados para Modal de Stock Masivo
  const [showBulkStockModal, setShowBulkStockModal] = useState(false);
  const [bulkStockValue, setBulkStockValue] = useState<number>(100);
  const [bulkStockMode, setBulkStockMode] = useState<"SET" | "ADD">("SET");

  // Estado para Edición Inline de Precio
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceUSD, setEditingPriceUSD] = useState<string>("");
  const [editingPricePEN, setEditingPricePEN] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 1. Manejo de Ordenamiento por Columna (Stock y Precio)
  const handleSortToggle = (column: "stock" | "price") => {
    let nextSort = "";
    if (column === "stock") {
      nextSort = currentSort === "stock_asc" ? "stock_desc" : "stock_asc";
    } else {
      nextSort = currentSort === "price_asc" ? "price_desc" : "price_asc";
    }
    router.push(`/dashboard/products?sort=${nextSort}`);
  };

  // Ordenamiento local inmediato
  const sortedProducts = [...products].sort((a, b) => {
    if (currentSort === "stock_asc") return a.stock - b.stock;
    if (currentSort === "stock_desc") return b.stock - a.stock;
    if (currentSort === "price_asc") return a.priceUSD - b.priceUSD;
    if (currentSort === "price_desc") return b.priceUSD - a.priceUSD;
    return 0;
  });

  // 2. Filtrado dinámico en tiempo real
  const filteredProducts = sortedProducts.filter((p) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.uniqueId && p.uniqueId.toLowerCase().includes(query)) ||
      (p.familyId && p.familyId.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (filterTab === "ACTIVE") return p.isActive;
    if (filterTab === "INACTIVE") return !p.isActive;
    if (filterTab === "OUT_OF_STOCK") return p.stock <= 0;

    return true;
  });

  // 3. Selección Múltiple (Checkboxes)
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

  // 4. Edición de Precio Inline Dual (Soles & Dólares)
  const handleStartEditingPrice = (product: SerializedProduct) => {
    setEditingPriceId(product.id);
    setEditingPriceUSD(product.priceUSD.toString());
    setEditingPricePEN((product.pricePEN || product.priceUSD * 3.75).toFixed(2));
  };

  const handleSaveInlinePrice = async (productId: string) => {
    if (!editingPriceId) return;

    const newUSD = parseFloat(editingPriceUSD);
    const newPEN = parseFloat(editingPricePEN);

    if (isNaN(newUSD) || newUSD < 0 || isNaN(newPEN) || newPEN < 0) {
      setEditingPriceId(null);
      return;
    }

    // Actualización optimista de UI
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, priceUSD: newUSD, pricePEN: newPEN, basePrice: newUSD }
          : p
      )
    );

    setEditingPriceId(null);

    // Guardado silencioso en Neon DB
    const res = await quickUpdatePriceAction(productId, newUSD, newPEN);
    if (res.success) {
      showToast(`✅ Precios guardados: S/. ${newPEN.toFixed(2)} / $${newUSD.toFixed(2)} USD`);
    } else {
      showToast(`❌ Error: ${res.error || "No se pudo actualizar el precio"}`);
    }
  };

  // 5. Acciones Masivas (Paso 1)
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedIds.length === 0) return;
    setIsProcessing(true);

    if (action === "activate") {
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, isActive: true } : p))
      );
      showToast(`✅ ${selectedIds.length} productos activados.`);
    } else if (action === "deactivate") {
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, isActive: false } : p))
      );
      showToast(`ℹ️ ${selectedIds.length} productos desactivados.`);
    } else if (action === "delete") {
      setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      showToast(`🗑️ ${selectedIds.length} productos eliminados.`);
      setShowDeleteModal(false);
    }

    await bulkUpdateProductsAction(selectedIds, action);
    setSelectedIds([]);
    setIsProcessing(false);
  };

  // 6. Fila Inmediata (Stock y Estado)
  const handleToggleStatus = async (id: string) => {
    setIsProcessing(true);
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
    showToast(`📦 Stock actualizado para ${selectedIds.length} productos.`);
  };

  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div className="space-y-6 relative">
      {/* Toast Notificación Flotante */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Barra de Filtros y Búsqueda Avanzada */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setFilterTab("ALL")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === "ALL"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              onClick={() => setFilterTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === "ACTIVE"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterTab("INACTIVE")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                filterTab === "INACTIVE"
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Inactivos
            </button>
            <button
              onClick={() => setFilterTab("OUT_OF_STOCK")}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                filterTab === "OUT_OF_STOCK"
                  ? "bg-rose-600 text-white font-bold"
                  : "text-rose-600 hover:bg-rose-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Sin Stock ({outOfStockCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Bar (Barra de Acciones Flotante - Paso 1) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 font-sans">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-emerald-400 text-black px-2.5 py-0.5 rounded-full font-mono text-xs">
              {selectedIds.length}
            </span>
            <span>seleccionados</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("activate")}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Activar</span>
            </button>

            <button
              onClick={() => handleBulkAction("deactivate")}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Desactivar</span>
            </button>

            <button
              onClick={() => setShowBulkStockModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Ajustar Stock</span>
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Desmarcar
          </button>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm font-sans">
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
                  <th className="px-5 py-3.5">SKU / ID Único</th>
                  <th className="px-6 py-3.5">Producto</th>
                  <th className="px-5 py-3.5">Categoría</th>

                  {/* Encabezado PRECIO VENTA (Sorting interactivo - Paso 3) */}
                  <th className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleSortToggle("price")}
                      className="inline-flex items-center gap-1.5 font-bold hover:text-slate-900 transition-colors uppercase tracking-wider ml-auto"
                    >
                      <span>PRECIO VENTA</span>
                      {currentSort === "price_asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                      {currentSort === "price_desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                      {currentSort !== "price_asc" && currentSort !== "price_desc" && (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </th>

                  {/* Encabezado STOCK (Sorting interactivo - Paso 3) */}
                  <th className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleSortToggle("stock")}
                      className="inline-flex items-center gap-1.5 font-bold hover:text-slate-900 transition-colors uppercase tracking-wider mx-auto"
                    >
                      <span>STOCK</span>
                      {currentSort === "stock_asc" && <ArrowUp className="w-3.5 h-3.5 text-blue-600" />}
                      {currentSort === "stock_desc" && <ArrowDown className="w-3.5 h-3.5 text-blue-600" />}
                      {currentSort !== "stock_asc" && currentSort !== "stock_desc" && (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="px-5 py-3.5">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  const pricePEN = p.pricePEN || p.priceUSD * 3.75;
                  const priceUSD = p.priceUSD || p.basePrice || 0;
                  const isEditingPrice = editingPriceId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50 transition-colors ${isChecked ? "bg-slate-50/80" : ""}`}
                    >
                      {/* Checkbox */}
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

                      {/* Thumbnail */}
                      <td className="px-4 py-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900">
                        {p.sku}
                        {p.uniqueId && (
                          <span className="block text-[10px] text-slate-400 font-normal font-sans">
                            ID: {p.uniqueId}
                          </span>
                        )}
                      </td>

                      {/* Título */}
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
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">{p.categoryName}</td>

                      {/* Edición Inline Dual de Precio (Soles & Dólares) */}
                      <td className="px-5 py-4 text-right">
                        {isEditingPrice ? (
                          <div className="flex flex-col gap-1.5 items-end bg-slate-50 p-2.5 rounded-xl border-2 border-blue-500 shadow-md font-mono text-xs animate-in fade-in zoom-in duration-100">
                            {/* Input Soles (PEN) */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-extrabold text-emerald-700">S/.</span>
                              <input
                                type="number"
                                step="0.01"
                                autoFocus
                                value={editingPricePEN}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingPricePEN(val);
                                  const num = parseFloat(val);
                                  if (!isNaN(num) && num >= 0) {
                                    setEditingPriceUSD((num / 3.75).toFixed(2));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveInlinePrice(p.id);
                                  if (e.key === "Escape") setEditingPriceId(null);
                                }}
                                className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-emerald-700 focus:outline-none focus:border-blue-600 text-right shadow-inner"
                              />
                            </div>

                            {/* Input Dólares (USD) */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500">$</span>
                              <input
                                type="number"
                                step="0.01"
                                value={editingPriceUSD}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingPriceUSD(val);
                                  const num = parseFloat(val);
                                  if (!isNaN(num) && num >= 0) {
                                    setEditingPricePEN((num * 3.75).toFixed(2));
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSaveInlinePrice(p.id);
                                  if (e.key === "Escape") setEditingPriceId(null);
                                }}
                                className="w-20 px-2 py-0.5 bg-white border border-slate-300 rounded font-bold text-slate-800 focus:outline-none focus:border-blue-600 text-right text-[11px] shadow-inner"
                              />
                              <span className="text-[10px] text-slate-400">USD</span>
                            </div>

                            {/* Botones de Confirmación / Cancelación */}
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => handleSaveInlinePrice(p.id)}
                                className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors shadow-sm flex items-center gap-0.5"
                              >
                                <Check className="w-3 h-3" />
                                <span>Guardar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPriceId(null)}
                                className="px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-[10px] transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => handleStartEditingPrice(p)}
                            className="font-mono text-xs cursor-pointer group p-1.5 rounded hover:bg-slate-100 transition-colors inline-block text-right"
                            title="Haz clic para editar precios en Soles y Dólares"
                          >
                            <span className="font-bold text-emerald-700 block group-hover:text-blue-600">
                              S/. {pricePEN.toFixed(2)} ✏️
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium block">
                              ${priceUSD.toFixed(2)} USD
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Stock Interactivo */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
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

                      {/* Estado */}
                      <td className="px-5 py-4 text-xs">
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
                      <td className="px-5 py-4 text-right">
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

      {/* Modal de Confirmación de Eliminación Masiva */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-full border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">¿Eliminar Productos Seleccionados?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Estás a punto de eliminar <strong className="text-slate-900">{selectedIds.length} productos</strong> de la base de datos Neon DB de forma permanente.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleBulkAction("delete")}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Ajuste Masivo de Stock */}
      {showBulkStockModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Ajustar Stock para {selectedIds.length} Productos
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
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
