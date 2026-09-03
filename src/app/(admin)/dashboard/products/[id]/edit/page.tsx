import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Save, Package, Layers, DollarSign, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateProductFullAction } from "../../actions";

export const revalidate = 0;

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;

  let product: any = null;
  let categories: any[] = [];
  let exchangeRate = 3.75;

  try {
    if (process.env.DATABASE_URL) {
      product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: true,
        },
      });

      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
      });

      const peRegion = await prisma.regionConfig.findUnique({
        where: { countryCode: "PE" },
      });
      if (peRegion) {
        exchangeRate = Number(peRegion.exchangeRate);
      }
    }
  } catch (err) {
    console.error("Error al obtener producto para editar de Neon DB:", err);
  }

  if (!product) {
    notFound();
  }

  const basePriceUSD = Number(product.basePrice);
  const equivPricePEN = (basePriceUSD * exchangeRate).toFixed(2);
  const costUSD = product.costPerItem ? Number(product.costPerItem) : 0;
  const equivCostPEN = (costUSD * exchangeRate).toFixed(2);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-body">
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-2 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Productos</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Editar Producto: {product.title}</h1>
        <p className="text-sm text-slate-500">
          Modifica el inventario, precios en USD/PEN, SKU y configuraciones de familia en Neon DB.
        </p>
      </div>

      <form action={updateProductFullAction.bind(null, product.id)} className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-slate-500" />
            <span>Ficha del Producto</span>
          </h2>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

        {/* Banner Informativo de Conversión Multi-Moneda */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <RefreshCw className="w-4 h-4 text-purple-600" />
            <span>
              <strong>Conversión Automática:</strong> Los precios se guardan en USD base en Neon DB. Para Perú (`S/.`), el precio de <strong>${basePriceUSD.toFixed(2)} USD</strong> equivale a <strong>S/. {equivPricePEN} PEN</strong> (Tasa: {exchangeRate}).
            </span>
          </div>
        </div>

        {/* Datos Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Producto *</label>
            <input
              type="text"
              name="title"
              defaultValue={product.title}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">SKU *</label>
            <input
              type="text"
              name="sku"
              defaultValue={product.sku}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ID Único (Excel)</label>
            <input
              type="text"
              name="uniqueId"
              defaultValue={product.uniqueId || ""}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Precios e Inventario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Precio Base ($ USD) *
            </label>
            <input
              type="number"
              step="0.01"
              name="basePrice"
              defaultValue={basePriceUSD}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
            />
            <span className="text-[11px] text-slate-500 font-mono mt-1 block">
              = S/. {equivPricePEN} PEN en Perú
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Costo Unitario ($ USD)</label>
            <input
              type="number"
              step="0.01"
              name="costPerItem"
              defaultValue={costUSD || ""}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:bg-white"
            />
            {costUSD > 0 && (
              <span className="text-[11px] text-slate-500 font-mono mt-1 block">
                = S/. {equivCostPEN} PEN
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Disponible (Unidades) *</label>
            <input
              type="number"
              name="stock"
              defaultValue={product.stock}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Familia & Variantes de Color */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFamily"
              name="isFamily"
              value="true"
              defaultChecked={product.isFamily}
              className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
            />
            <label htmlFor="isFamily" className="text-xs font-bold text-slate-800 cursor-pointer flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>¿Es Variante de Familia?</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ID Familia (Colección)</label>
            <input
              type="text"
              name="familyId"
              defaultValue={product.familyId || ""}
              placeholder="Ej: FAM-DECKBOX"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Producto</label>
            <input
              type="text"
              name="productType"
              defaultValue={product.productType || ""}
              placeholder="Ej: Sleeves, Binders"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:bg-white"
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
