import React from "react";
import Link from "next/link";
import { Plus, Package, FileSpreadsheet, Layers, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function ProductsListPage() {
  let products: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      products = await prisma.product.findMany({
        include: {
          category: true,
          images: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al cargar productos de Neon DB:", err);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Productos & Inventario</h1>
          <p className="text-sm text-slate-500">Catálogo de productos y variantes de familia en Neon DB.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products/import"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar desde Excel</span>
          </Link>

          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Aún no hay productos creados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Usa el importador masivo de Excel o crea tu primer producto manualmente.
            </p>
            <Link
              href="/dashboard/products/import"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Cargar Plantilla Excel</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Imagen</th>
                  <th className="px-6 py-3.5">SKU / ID Único</th>
                  <th className="px-6 py-3.5">Producto</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Familia (Variante)</th>
                  <th className="px-6 py-3.5">Precio ($ USD)</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const imgUrl = p.images?.[0]?.url;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                          {imgUrl ? (
                            <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">{p.sku}</td>
                      <td className="px-6 py-4">
                        <Link href={`/products/${p.id}`} className="font-semibold text-slate-900 text-xs hover:text-blue-600 transition-colors block">
                          {p.title}
                        </Link>
                        {p.productType && (
                          <span className="text-[10px] text-slate-400 font-mono block">{p.productType}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{p.category?.name || "General"}</td>
                      <td className="px-6 py-4 text-xs">
                        {p.isFamily ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                            <Layers className="w-3 h-3" /> {p.familyId || "SI"}
                          </span>
                        ) : (
                          <span className="text-slate-400">Único</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">${Number(p.basePrice).toFixed(2)}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{p.stock} un.</td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${p.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
