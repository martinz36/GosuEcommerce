import React from "react";
import Link from "next/link";
import { Plus, Package, ExternalLink, Image as ImageIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function ProductsListPage() {
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
  }

  return (
    <div className="space-y-6">
      {/* Header de la sección de productos */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventario de Productos</h1>
          <p className="text-sm text-slate-500">Gestión de productos y carga de imágenes en Cloudinary</p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-md shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Producto</span>
        </Link>
      </div>

      {/* Tabla de Productos en Neon DB */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Aún no hay productos</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Empieza creando tu primer producto con subida directa de imágenes a Cloudinary.
            </p>
            <Link
              href="/dashboard/products/new"
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Primer Producto</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Producto</th>
                  <th className="px-6 py-3.5">SKU</th>
                  <th className="px-6 py-3.5">Categoría</th>
                  <th className="px-6 py-3.5">Precio</th>
                  <th className="px-6 py-3.5">Stock</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const mainImage = product.images[0]?.url;
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400">
                            {mainImage ? (
                              <img src={mainImage} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {product.title}
                            </span>
                            <span className="text-xs text-slate-400 block line-clamp-1">
                              {product.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{product.sku}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {product.category?.name || "General"}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ${Number(product.basePrice).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {product.stock} un.
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activo
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <span>Ver en tienda</span>
                          <ExternalLink className="w-3 h-3" />
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
    </div>
  );
}
