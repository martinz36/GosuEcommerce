"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  X,
  Package,
  DollarSign,
  Coins
} from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  const router = useRouter();

  // Estados del Formulario y Carga de Imagen
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [categoryName, setCategoryName] = useState("Sleeves");

  // Precios Explícitos en Soles (PEN) y Dólares (USD)
  const [priceUSD, setPriceUSD] = useState("");
  const [compareAtPriceUSD, setCompareAtPriceUSD] = useState("");
  const [costUSD, setCostUSD] = useState("");

  const [pricePEN, setPricePEN] = useState("");
  const [compareAtPricePEN, setCompareAtPricePEN] = useState("");
  const [costPEN, setCostPEN] = useState("");

  const [stock, setStock] = useState("50");

  // Estados de Cloudinary
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Estados de Envío del Server Action
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Cálculo conveniente sugerido si el otro campo está vacío
  const handlePriceUSDChange = (val: string) => {
    setPriceUSD(val);
    if (val && !pricePEN) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setPricePEN((num * 3.75).toFixed(2));
      }
    }
  };

  const handlePricePENChange = (val: string) => {
    setPricePEN(val);
    if (val && !priceUSD) {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setPriceUSD((num / 3.75).toFixed(2));
      }
    }
  };

  // Handler para subir imagen a Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageToCloudinary(formData);

    if (res.success && res.data) {
      setImageUrl(res.data.secure_url);
    } else {
      setUploadError(res.error || "No se pudo subir la imagen a Cloudinary.");
    }

    setIsUploading(false);
  };

  // Handler para enviar formulario a Neon Postgres vía Server Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!priceUSD && !pricePEN)) {
      setSubmitError("Por favor completa los campos obligatorios: Nombre y al menos un Precio (Soles o Dólares).");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("sku", sku);
    formData.append("categoryName", categoryName);
    formData.append("priceUSD", priceUSD);
    formData.append("pricePEN", pricePEN);
    formData.append("compareAtPriceUSD", compareAtPriceUSD);
    formData.append("compareAtPricePEN", compareAtPricePEN);
    formData.append("costUSD", costUSD);
    formData.append("costPEN", costPEN);
    formData.append("stock", stock);

    if (imageUrl) {
      formData.append("imageUrl", imageUrl);
    }

    const result = await createProductAction(formData);

    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/products");
      }, 1200);
    } else {
      setSubmitError(result.error || "Error al guardar el producto.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-body">
      {/* Volver al listado */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de productos</span>
        </Link>
      </div>

      {/* Encabezado del Formulario */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Crear Nuevo Producto</h1>
        <p className="text-sm text-slate-500">
          Sube la imagen a Cloudinary y configura los precios duales e inventario en Neon DB.
        </p>
      </div>

      {/* Mensajes de Alerta */}
      {submitError && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>¡Producto guardado exitosamente en Neon Postgres! Redirigiendo...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloque 1: Carga de Imagen con Cloudinary */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>Imagen del Producto (Cloudinary)</span>
            </h2>
            <p className="text-xs text-slate-500">Sube imágenes en formato PNG, JPG o WEBP.</p>
          </div>

          {imageUrl ? (
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 group">
              <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-full transition-colors"
                title="Eliminar imagen"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[10px] py-1 text-center font-mono truncate px-2">
                Cloudinary Ready
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
              {isUploading ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-700" />
                  <span className="text-xs font-semibold">Subiendo a Cloudinary...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="p-3 bg-white rounded-full border border-slate-200 shadow-xs text-slate-600">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Haz clic para seleccionar o arrastra una imagen
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Sube directo a Cloudinary y obtiene `secure_url`
                    </span>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          )}

          {uploadError && (
            <p className="text-xs text-rose-600 font-medium">{uploadError}</p>
          )}
        </div>

        {/* Bloque 2: Información General del Producto */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <span>Información General</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: GOSU® Armor Sleeves - Japanese Size (Matte Black)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción Detallada
              </label>
              <textarea
                rows={4}
                placeholder="Describe las características técnicas, durabilidad y compatibilidad..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Categoría *
                </label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                >
                  <option value="Sleeves">Sleeves / Fundas</option>
                  <option value="Binders">Binders / Carpetas</option>
                  <option value="Deck Boxes">Deck Boxes / Cajas</option>
                  <option value="Bundles">Packs & Bundles</option>
                  <option value="Accesorios">Accesorios Varios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SKU (Código Único)
                </label>
                <input
                  type="text"
                  placeholder="Ej: GOSU-SLV-001 (Opcional, autogenerado si está vacío)"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bloque 3: Precios Duales Independientes e Inventario */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-500" />
              <span>Precios Duales Independientes e Inventario</span>
            </h2>
          </div>

          {/* Banner Informativo */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Precios Independientes:</strong> Los clientes de Perú verán el precio en Soles (S/.) y los internacionales en Dólares ($ USD).
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Tarjeta Soles PEN */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🇵🇪 Precio para Perú (Soles PEN)</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio en Soles (S/.) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 40.00"
                  value={pricePEN}
                  onChange={(e) => handlePricePENChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio Oferta / Tachado (S/.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 50.00 (Mayor al precio)"
                  value={compareAtPricePEN}
                  onChange={(e) => setCompareAtPricePEN(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-rose-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Costo en Soles (S/.)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 15.00"
                  value={costPEN}
                  onChange={(e) => setCostPEN(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tarjeta Dólares USD */}
            <div className="p-4 bg-blue-50/50 border border-blue-200/60 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>🇺🇸 Precio Internacional (Dólares USD)</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio en Dólares ($ USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 10.67"
                  value={priceUSD}
                  onChange={(e) => handlePriceUSDChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio Oferta / Tachado ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 14.99 (Mayor al precio)"
                  value={compareAtPriceUSD}
                  onChange={(e) => setCompareAtPriceUSD(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-rose-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Costo en Dólares ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ej: 4.00"
                  value={costUSD}
                  onChange={(e) => setCostUSD(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cantidad en Stock *
            </label>
            <input
              type="number"
              required
              placeholder="50"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
            />
          </div>
        </div>

        {/* Botón de Envío */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard/products"
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando en Neon DB...</span>
              </>
            ) : (
              <span>Guardar Producto</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
