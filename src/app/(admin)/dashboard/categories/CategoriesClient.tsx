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
} from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
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

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");

  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Campos del Formulario
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Estados de Operación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de Eliminación
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Abrir Modal para Crear
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setFormError(null);
    setShowFormModal(true);
  };

  // Abrir Modal para Editar
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

  // Filtrado local
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
              Crea, edita y administra las categorías únicas sincronizadas en el catálogo y los filtros de la tienda.
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
                  <th className="px-5 py-3.5 text-center">Productos</th>
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

                      {/* Cantidad de Productos */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <Package className="w-3 h-3 text-slate-500" />
                          <span>{productCount} {productCount === 1 ? "prod." : "prods."}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Editar Categoría"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

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
