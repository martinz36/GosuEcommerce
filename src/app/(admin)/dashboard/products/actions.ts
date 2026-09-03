"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleProductStatusAction(id: string) {
  try {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Producto no encontrado." };

    await prisma.product.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error al alternar estado del producto:", error);
    return { success: false, error: error?.message };
  }
}

export async function quickUpdateStockAction(id: string, newStock: number) {
  try {
    const validStock = Math.max(0, Math.floor(newStock));
    await prisma.product.update({
      where: { id },
      data: { stock: validStock },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar stock de producto:", error);
    return { success: false, error: error?.message };
  }
}

export async function bulkUpdateStockAction(
  productIds: string[],
  stockValue: number,
  mode: "SET" | "ADD" = "SET"
) {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se seleccionaron productos." };
    }

    if (mode === "SET") {
      const validStock = Math.max(0, Math.floor(stockValue));
      await prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { stock: validStock },
      });
    } else {
      for (const id of productIds) {
        const prod = await prisma.product.findUnique({ where: { id } });
        if (prod) {
          const updatedStock = Math.max(0, prod.stock + Math.floor(stockValue));
          await prisma.product.update({
            where: { id },
            data: { stock: updatedStock },
          });
        }
      }
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true, message: `Stock actualizado para ${productIds.length} productos.` };
  } catch (error: any) {
    console.error("Error en actualización masiva de stock:", error);
    return { success: false, error: error?.message || "Error al actualizar stock masivamente." };
  }
}

export async function bulkToggleStatusAction(productIds: string[], targetStatus: boolean) {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "No se seleccionaron productos." };
    }

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { isActive: targetStatus },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true, message: `Estado actualizado para ${productIds.length} productos.` };
  } catch (error: any) {
    console.error("Error en actualización masiva de estado:", error);
    return { success: false, error: error?.message || "Error al actualizar estado masivamente." };
  }
}

export async function updateProductFullAction(id: string, formData: FormData): Promise<void> {
  try {
    const title = formData.get("title") as string;
    const sku = formData.get("sku") as string;
    const basePriceStr = formData.get("basePrice") as string;
    const costPerItemStr = formData.get("costPerItem") as string;
    const stockStr = formData.get("stock") as string;
    const uniqueId = formData.get("uniqueId") as string;
    const familyId = formData.get("familyId") as string;
    const isFamilyStr = formData.get("isFamily") as string;
    const productType = formData.get("productType") as string;
    const description = formData.get("description") as string;

    if (!title || !sku || !basePriceStr) return;

    const basePrice = parseFloat(basePriceStr);
    const costPerItem = costPerItemStr ? parseFloat(costPerItemStr) : null;
    const stock = stockStr ? parseInt(stockStr, 10) : 0;
    const isFamily = isFamilyStr === "true" || isFamilyStr === "on";

    await prisma.product.update({
      where: { id },
      data: {
        title: title.trim(),
        sku: sku.trim(),
        basePrice,
        costPerItem,
        stock: Math.max(0, stock),
        uniqueId: uniqueId ? uniqueId.trim() : null,
        familyId: familyId ? familyId.trim() : null,
        isFamily,
        productType: productType ? productType.trim() : null,
        description: description ? description.trim() : title,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar producto completo:", error);
  }
}

export async function createProductAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const sku = formData.get("sku") as string;
    const basePriceStr = formData.get("basePrice") as string;
    const costPerItemStr = formData.get("costPerItem") as string;
    const stockStr = formData.get("stock") as string;
    const description = formData.get("description") as string;
    const categoryName = (formData.get("category") as string) || "General";
    const imageUrl = formData.get("imageUrl") as string;

    if (!title || !sku || !basePriceStr) {
      return { success: false, error: "El título, SKU y precio son obligatorios." };
    }

    const basePrice = parseFloat(basePriceStr);
    const costPerItem = costPerItemStr ? parseFloat(costPerItemStr) : null;
    const stock = stockStr ? parseInt(stockStr, 10) : 100;
    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${sku.toLowerCase()}`;

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

    const newProduct = await prisma.product.create({
      data: {
        title: title.trim(),
        sku: sku.trim(),
        slug: slug,
        basePrice,
        costPerItem,
        stock: Math.max(0, stock),
        description: description ? description.trim() : title,
        categoryId: category.id,
        isActive: true,
      },
    });

    if (imageUrl && imageUrl.startsWith("http")) {
      await prisma.productImage.create({
        data: {
          productId: newProduct.id,
          url: imageUrl,
          publicId: `upload_${Date.now()}`,
        },
      });
    }

    revalidatePath("/dashboard/products");
    revalidatePath("/");
    return { success: true, message: "Producto creado con éxito." };
  } catch (error: any) {
    console.error("Error al crear producto nuevo:", error);
    return { success: false, error: error?.message || "Error al crear producto." };
  }
}
