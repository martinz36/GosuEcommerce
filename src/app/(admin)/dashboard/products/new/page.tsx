import React from "react";
import { prisma } from "@/lib/prisma";
import { NewProductForm, CategoryOption } from "./NewProductForm";

export const revalidate = 0;

export default async function NewProductPage() {
  let categories: CategoryOption[] = [];

  try {
    if (process.env.DATABASE_URL) {
      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      });
    }
  } catch (err) {
    console.error("Error al obtener categorías para nuevo producto:", err);
  }

  return <NewProductForm categories={categories} />;
}
