"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Package,
  Sparkles,
  Tag,
  CheckSquare,
  PackageCheck,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  assignProductsToCategoryAction,
} from "./actions";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  createdAt: Date | string;
  _count?: {
    products: number;
  };
}

export interface SimpleProduct {
  id: string;
  title: string;
  sku: string;
  priceUSD: number;
  pricePEN: number;
  categoryId: string;
  categoryName: string;
  imageUrl?: string | null;
}

export function CategoriesClient({
  initialCategories,
  initialProducts = [],
}: {
  initialCategories: CategoryItem[];
  initialProducts?: SimpleProduct[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [allProducts, setAllProducts] = useState<SimpleProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");

  // Modales Formulario Categoría
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Campos del Formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Estados de Operación Formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Eliminación
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Modal de Asignación de Productos
  const [assigningCategory, setAssigningCategory] = useState<CategoryItem | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalTabFilter, setModalTabFilter] = useState<"ALL" | "SELECTED" | "UNSELECTED">("ALL");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Abrir Modal para Crear Categoría
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setFormError(null);
    setShowFormModal(true);
  };

  // Abrir Modal para Editar Categoría
  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setFormError(null);
    setShowFormModal(true);
  };

  // Generación automática de slug mientras escribe el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    }
  };

  // Enviar Formulario (Crear / Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("El nombre de la categoría es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);

    let res: { success: boolean; error?: string };

    if (editingCategory) {
      res = await updateCategoryAction(editingCategory.id, formData);
    } else {
      res = await createCategoryAction(formData);
    }

    if (res.success) {
      showToast(
        editingCategory
          ? `Categoría "${name}" actualizada correctamente.`
          : `Categoría "${name}" creada exitosamente.`
      );
      setShowFormModal(false);
      window.location.reload();
    } else {
      setFormError(res.error || "Ocurrió un error al procesar la categoría.");
      setIsSubmitting(false);
    }
  };

  // Confirmar Eliminación
  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deleteCategoryAction(deletingCategory.id);

    if (res.success) {
      showToast(`Categoría "${deletingCategory.name}" eliminada.`);
      setDeletingCategory(null);
      window.location.reload();
    } else {
      setDeleteError(res.error || "No se pudo eliminar la categoría.");
      setIsDeleting(false);
    }
  };

  // --- MÓDULO DE ASIGNACIÓN DE PRODUCTOS A CATEGORÍA ---
  const handleOpenAssignModal = (category: CategoryItem) => {
    setAssigningCategory(category);
    const initialAssignedIds = allProducts
      .filter((p) => p.categoryId === category.id)
      .map((p) => p.id);
    setSelectedProductIds(initialAssignedIds);
    setModalSearchQuery("");
    setModalTabFilter("ALL");
    setAssignError(null);
  };

  const handleToggleProductCheck = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSaveProductAssignments = async () => {
    if (!assigningCategory) return;
    setIsAssigning(true);
    setAssignError(null);

    const res = await assignProductsToCategoryAction(assigningCategory.id, selectedProductIds);

    if (res.success) {
      showToast(
        `Se han asignado ${selectedProductIds.length} productos a la categoría "${assigningCategory.name}".`
      );
      setAssigningCategory(null);
      window.location.reload();
    } else {
      setAssignError(res.error || "Error al actualizar asignación de productos.");
      setIsAssigning(false);
    }
  };

  // Filtrado de productos dentro del Modal de Asignación
  const modalFilteredProducts = allProducts.filter((p) => {
    const q = modalSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    const isSelected = selectedProductIds.includes(p.id);
    if (modalTabFilter === "SELECTED") return isSelected;
    if (modalTabFilter === "UNSELECTED") return !isSelected;

    return true;
  });

  // Acciones rápidas en modal de asignación
  const handleSelectAllVisible = () => {
    const visibleIds = modalFilteredProducts.map((p) => p.id);
    const newSelected = Array.from(new Set([...selectedProductIds, ...visibleIds]));
    setSelectedProductIds(newSelected);
  };

  const handleDeselectAllVisible = () => {
    const visibleIds = modalFilteredProducts.map((p) => p.id);
    setSelectedProductIds(selectedProductIds.filter((id) => !visibleIds.includes(id)));
  };

  // Filtrado local de categorías en tabla principal
  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-body">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs font-mono flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Gestión de Categorías
            </h1>
            <p className="text-xs text-slate-500 font-mono">
              Crea, edita, asigna productos con un click y administra las categorías sincronizadas en la tienda.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Filtros & Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nombre, Slug o Descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Total: <strong className="text-slate-900 font-bold">{filteredCategories.length}</strong> categorías
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 font-mono italic">
              {searchQuery
                ? `No se encontraron categorías que coincidan con "${searchQuery}".`
                : "Aún no se han registrado categorías. Haz clic en 'Nueva Categoría' para agregar la primera."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-5 py-3.5">Categoría</th>
                  <th className="px-5 py-3.5">Slug (URL)</th>
                  <th className="px-5 py-3.5">Descripción</th>
                  <th className="px-5 py-3.5 text-center">Productos Asignados</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCategories.map((c) => {
                  const productCount = c._count?.products || 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      {/* Nombre */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{c.name}</span>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-5 py-4 font-mono text-purple-700 font-semibold">
                        /{c.slug}
                      </td>

                      {/* Descripción */}
                      <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                        {c.description || <span className="italic text-slate-300">Sin descripción</span>}
                      </td>

                      {/* Cantidad de Productos (Badge Clickable para Asignar) */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenAssignModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all cursor-pointer group shadow-2xs"
                          title="Haz clic para seleccionar o añadir productos a esta categoría con checkboxes"
                        >
                          <PackageCheck className="w-3.5 h-3.5 text-purple-600 group-hover:scale-110 transition-transform" />
                          <span>{productCount} {productCount === 1 ? "prod." : "prods."}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Asignar Productos por Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleOpenAssignModal(c)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-mono font-bold text-[11px] transition-colors flex items-center gap-1 border border-indigo-200"
                            title="Asignar Productos con buscador y checks"
                          >
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>Asignar Productos</span>
                          </button>

                          {/* Botón Editar Categoría */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Editar Datos de Categoría"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Botón Eliminar Categoría */}
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(c)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Eliminar Categoría"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* --- MODAL INTERACTIVO DE ASIGNACIÓN DE PRODUCTOS (CHECKBOXES + BUSCADOR) --- */}
      {assigningCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-body">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-mono">
                    Asignar Productos a "{assigningCategory.name}"
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Busca productos y marca con check los que deben pertenecer a esta categoría.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCategory(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-mono shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{assignError}</span>
              </div>
            )}

            {/* Buscador & Pestañas de Filtro en Modal */}
            <div className="space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Escribe para buscar por nombre de producto o SKU..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-600 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setModalTabFilter("ALL")}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      modalTabFilter === "ALL"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Todos ({allProducts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTabFilter("SELECTED")}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      modalTabFilter === "SELECTED"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "text-purple-700 hover:bg-purple-50"
                    }`}
                  >
                    Seleccionados ({selectedProductIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTabFilter("UNSELECTED")}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      modalTabFilter === "UNSELECTED"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Sin Asignar ({allProducts.length - selectedProductIds.length})
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectAllVisible}
                    className="text-purple-700 hover:underline font-bold"
                  >
                    Marcar Visibles
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllVisible}
                    className="text-slate-500 hover:underline font-bold"
                  >
                    Desmarcar Visibles
                  </button>
                </div>
              </div>
            </div>

            {/* Lista Scrollable de Productos con Checkbox */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50 p-2 min-h-[260px] max-h-[360px]">
              {modalFilteredProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 italic font-mono">
                  No se encontraron productos que coincidan con la búsqueda.
                </div>
              ) : (
                modalFilteredProducts.map((p) => {
                  const isChecked = selectedProductIds.includes(p.id);

                  return (
                    <label
                      key={p.id}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors select-none ${
                        isChecked
                          ? "bg-purple-50/80 border border-purple-200/80 shadow-2xs"
                          : "hover:bg-slate-100 bg-white border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox personalizable */}
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? "bg-purple-600 border-purple-600 text-white"
                              : "bg-white border-slate-300 hover:border-purple-500"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        {/* Miniatura Imagen */}
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        {/* Info Producto */}
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {p.title}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 block truncate">
                            SKU: {p.sku} | <strong className="text-slate-700">S/. {p.pricePEN.toFixed(2)}</strong> ($ {p.priceUSD.toFixed(2)})
                          </span>
                        </div>
                      </div>

                      {/* Categoría Actual Badge */}
                      <div className="shrink-0 pl-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                            isChecked
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isChecked ? `✓ Pertenece a ${assigningCategory.name}` : `Cat: ${p.categoryName}`}
                        </span>
                      </div>

                      {/* Input oculto para accesibilidad */}
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleProductCheck(p.id)}
                        className="hidden"
                      />
                    </label>
                  );
                })
              )}
            </div>

            {/* Footer Modal de Asignación */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 shrink-0 font-mono text-xs">
              <span className="text-slate-500">
                <strong className="text-purple-700 font-bold">{selectedProductIds.length}</strong> productos seleccionados para esta categoría.
              </span>

              <div className="flex items-center gap-2 font-body">
                <button
                  type="button"
                  onClick={() => setAssigningCategory(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isAssigning}
                  onClick={handleSaveProductAssignments}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 font-mono"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en Neon DB...</span>
                    </>
                  ) : (
                    <span>Guardar Asignaciones ({selectedProductIds.length})</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear / Editar Categoría */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-body">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 font-mono uppercase">
                  {editingCategory ? "Editar Categoría" : "Crear Nueva Categoría"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-body">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sleeves / Fundas, Binders, TCG"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Slug (URL Amigable)
                </label>
                <input
                  type="text"
                  placeholder="Ej. sleeves-fundas"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-purple-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Se utiliza en la URL y filtros de la tienda (ej: /catalog?category={slug || "slug"}).
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Breve explicación de la categoría..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? "Guardar Cambios" : "Crear Categoría"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-body">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  Eliminar Categoría
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  "{deletingCategory.name}"
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la categoría <strong className="text-slate-900">{deletingCategory.name}</strong>? Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sí, Eliminar</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
