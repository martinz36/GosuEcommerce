"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ExcelImportRow {
  sku: string;
  uniqueId?: string;
  isFamily: boolean;
  familyId?: string;
  title: string;
  category: string;
  cost?: number;
  costPerItem?: number;
  price: number;
  basePrice: number;
  imageUrl?: string;
  productType?: string;
}

export type ExcelProductInput = ExcelImportRow;

export async function processExcelProductsAction(
  rows: ExcelImportRow[],
  sourceCurrency: "PEN" | "USD" = "PEN",
  exchangeRate: number = 3.75
) {
  try {
    if (!rows || rows.length === 0) {
      return { success: false, error: "El archivo no contiene filas válidas de productos." };
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const row of rows) {
      const rawPrice = row.price !== undefined ? Number(row.price) : Number(row.basePrice || 0);
      const rawCost = row.cost !== undefined ? Number(row.cost) : (row.costPerItem !== undefined ? Number(row.costPerItem) : null);

      if (!row.sku || !row.title || isNaN(rawPrice)) {
        continue;
      }

      const cleanSku = String(row.sku).trim();
      const cleanTitle = String(row.title).trim();
      const cleanCategoryName = row.category ? String(row.category).trim() : "General";

      // Generar Precios Duales Explícitos e Independientes (Soles y Dólares)
      let priceUSD = 0;
      let pricePEN = 0;
      let costUSD: number | null = null;
      let costPEN: number | null = null;

      if (sourceCurrency === "PEN") {
        pricePEN = Math.round(rawPrice * 100) / 100;
        priceUSD = Math.round((pricePEN / exchangeRate) * 100) / 100;
        if (rawCost !== null) {
          costPEN = Math.round(rawCost * 100) / 100;
          costUSD = Math.round((costPEN / exchangeRate) * 100) / 100;
        }
      } else {
        priceUSD = Math.round(rawPrice * 100) / 100;
        pricePEN = Math.round(priceUSD * exchangeRate * 100) / 100;
        if (rawCost !== null) {
          costUSD = Math.round(rawCost * 100) / 100;
          costPEN = Math.round(costUSD * exchangeRate * 100) / 100;
        }
      }

      const slug = `${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${cleanSku.toLowerCase()}`;

      let category = await prisma.category.findFirst({
        where: { name: { equals: cleanCategoryName, mode: "insensitive" } },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: cleanCategoryName,
            slug: cleanCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          },
        });
      }

      const existingProduct = await prisma.product.findUnique({
        where: { sku: cleanSku },
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { sku: cleanSku },
          data: {
            title: cleanTitle,
            basePrice: priceUSD,
            priceUSD: priceUSD,
            pricePEN: pricePEN,
            costUSD: costUSD,
            costPEN: costPEN,
            costPerItem: costUSD,
            uniqueId: row.uniqueId ? String(row.uniqueId).trim() : existingProduct.uniqueId,
            isFamily: row.isFamily,
            familyId: row.familyId ? String(row.familyId).trim() : existingProduct.familyId,
            productType: row.productType ? String(row.productType).trim() : existingProduct.productType,
            categoryId: category.id,
            isActive: true,
          },
        });
        updatedCount++;
      } else {
        const newProduct = await prisma.product.create({
          data: {
            sku: cleanSku,
            title: cleanTitle,
            slug: slug,
            basePrice: priceUSD,
            priceUSD: priceUSD,
            pricePEN: pricePEN,
            costUSD: costUSD,
            costPEN: costPEN,
            costPerItem: costUSD,
            stock: 100,
            description: `${cleanTitle} - ${cleanCategoryName}`,
            uniqueId: row.uniqueId ? String(row.uniqueId).trim() : null,
            isFamily: row.isFamily,
            familyId: row.familyId ? String(row.familyId).trim() : null,
            productType: row.productType ? String(row.productType).trim() : null,
            categoryId: category.id,
            isActive: true,
          },
        });

        if (row.imageUrl && String(row.imageUrl).startsWith("http")) {
          await prisma.productImage.create({
            data: {
              productId: newProduct.id,
              url: String(row.imageUrl).trim(),
              publicId: `excel_import_${cleanSku}`,
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
      message: `Importación completada: ${createdCount} creados, ${updatedCount} actualizados con precios duales PEN/USD.`,
    };
  } catch (error: any) {
    console.error("Error al procesar importación de Excel en Neon DB:", error);
    return {
      success: false,
      error: error?.message || "Error interno al procesar el archivo Excel.",
    };
  }
}

export const bulkImportProductsAction = processExcelProductsAction;
