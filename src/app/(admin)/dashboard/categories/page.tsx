import React from "react";
import { prisma } from "@/lib/prisma";
import { CategoriesClient, CategoryItem } from "./CategoriesClient";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  let categories: CategoryItem[] = [];
  let allProducts: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: "asc" },
      });

      const rawProducts = await prisma.product.findMany({
        select: {
          id: true,
          title: true,
          sku: true,
          priceUSD: true,
          pricePEN: true,
          categoryId: true,
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            take: 1,
            select: { url: true },
          },
        },
        orderBy: { title: "asc" },
      });

      allProducts = rawProducts.map((p) => ({
        id: p.id,
        title: p.title,
        sku: p.sku,
        priceUSD: Number(p.priceUSD || 0),
        pricePEN: Number(p.pricePEN || 0),
        categoryId: p.categoryId,
        categoryName: p.category?.name || "Sin Categoría",
        imageUrl: p.images?.[0]?.url || null,
      }));
    }
  } catch (err) {
    console.error("Error al cargar datos del módulo de categorías en Neon DB:", err);
  }

  return (
    <CategoriesClient
      initialCategories={categories}
      initialProducts={allProducts}
    />
  );
}
