import React from "react";
import { prisma } from "@/lib/prisma";
import { CategoriesClient, CategoryItem } from "./CategoriesClient";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  let categories: CategoryItem[] = [];

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
    }
  } catch (err) {
    console.error("Error al cargar categorías de Neon DB:", err);
  }

  return <CategoriesClient initialCategories={categories} />;
}
