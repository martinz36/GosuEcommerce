"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ExcelProductInput {
  sku: string;
  uniqueId?: string;
  isFamily?: boolean;
  familyId?: string;
  title: string;
  category?: string;
  costPerItem?: number;
  basePrice: number;
  imageUrl?: string;
  productType?: string;
}

export async function bulkImportProductsAction(products: ExcelProductInput[]) {
  try {
    if (!products || products.length === 0) {
      return { success: false, error: "No se enviaron productos para importar." };
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const p of products) {
      if (!p.sku || !p.title || !p.basePrice) continue;

      const cleanSku = p.sku.trim();
      const categoryName = p.category?.trim() || "General";
      const slug = `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cleanSku.toLowerCase()}`;

      // 1. Asegurar la existencia de la categoría
      let category = await prisma.category.findFirst({
        where: { name: { equals: categoryName, mode: "insensitive" } },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          },
        });
      }

      // 2. Upsert del producto en Neon Postgres
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [{ sku: cleanSku }, { uniqueId: p.uniqueId ? p.uniqueId.trim() : undefined }],
        },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            title: p.title,
            basePrice: p.basePrice,
            costPerItem: p.costPerItem || null,
            uniqueId: p.uniqueId ? p.uniqueId.trim() : null,
            isFamily: p.isFamily || false,
            familyId: p.familyId ? p.familyId.trim() : null,
            productType: p.productType || null,
            categoryId: category.id,
          },
        });

        if (p.imageUrl) {
          await prisma.productImage.create({
            data: {
              productId: existingProduct.id,
              url: p.imageUrl,
              publicId: `excel_${Date.now()}`,
            },
          });
        }

        updatedCount++;
      } else {
        const newProduct = await prisma.product.create({
          data: {
            sku: cleanSku,
            slug: slug,
            title: p.title,
            description: `${p.title} - ${p.productType || 'Accesorio TCG'}`,
            basePrice: p.basePrice,
            costPerItem: p.costPerItem || null,
            stock: 100,
            uniqueId: p.uniqueId ? p.uniqueId.trim() : null,
            isFamily: p.isFamily || false,
            familyId: p.familyId ? p.familyId.trim() : null,
            productType: p.productType || null,
            categoryId: category.id,
            isActive: true,
          },
        });

        if (p.imageUrl) {
          await prisma.productImage.create({
            data: {
              productId: newProduct.id,
              url: p.imageUrl,
              publicId: `excel_${Date.now()}`,
            },
          });
        }

        createdCount++;
      }
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/");

    return {
      success: true,
      message: `Importación completada en Neon DB: ${createdCount} creados, ${updatedCount} actualizados.`,
    };
  } catch (error: any) {
    console.error("Error en importación masiva desde Excel:", error);
    return { success: false, error: error?.message || "Ocurrió un error al procesar el archivo Excel." };
  }
}
