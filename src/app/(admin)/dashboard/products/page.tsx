import React from "react";
import Link from "next/link";
import { Plus, FileSpreadsheet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductsTableClient, SerializedProduct } from "./ProductsTableClient";

export const revalidate = 0;

export default async function ProductsListPage() {
  let dbProducts: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      dbProducts = await prisma.product.findMany({
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

  const serializedProducts: SerializedProduct[] = dbProducts.map((p) => {
    const priceUSD = Number(p.priceUSD || p.basePrice);
    const pricePEN = Number(p.pricePEN || (priceUSD * 3.75).toFixed(2));
    const costUSD = p.costUSD || p.costPerItem ? Number(p.costUSD || p.costPerItem) : null;
    const costPEN = p.costPEN ? Number(p.costPEN) : (costUSD ? Number((costUSD * 3.75).toFixed(2)) : null);

    return {
      id: p.id,
      title: p.title,
      sku: p.sku,
      uniqueId: p.uniqueId,
      priceUSD,
      pricePEN,
      costUSD,
      costPEN,
      basePrice: priceUSD,
      costPerItem: costUSD,
      stock: p.stock,
      isActive: p.isActive,
      isFamily: p.isFamily,
      familyId: p.familyId,
      productType: p.productType,
      categoryName: p.category?.name || "General",
      imageUrl: p.images?.[0]?.url || null,
    };
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión de Productos & Inventario</h1>
          <p className="text-sm text-slate-500">Catálogo de productos, costos, precios en Soles/USD y stock en Neon DB.</p>
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

      {/* Componente Cliente Interactivo con Precios en Soles, Dólares y Costos */}
      <ProductsTableClient initialProducts={serializedProducts} />
    </div>
  );
}
