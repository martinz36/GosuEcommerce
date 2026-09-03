"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateProductInput {
  title: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  stock: number;
  sku: string;
  imageUrl?: string | null;
  categoryName?: string;
}

export async function createProductAction(formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const basePriceStr = formData.get("basePrice") as string;
    const compareAtPriceStr = formData.get("compareAtPrice") as string;
    const stockStr = formData.get("stock") as string;
    const skuInput = formData.get("sku") as string;
    const imageUrl = formData.get("imageUrl") as string;
    const categoryName = (formData.get("categoryName") as string) || "Accesorios TCG";

    if (!title || !description || !basePriceStr) {
      return { success: false, error: "Los campos Nombre, Descripción y Precio son obligatorios." };
    }

    const basePrice = parseFloat(basePriceStr);
    const compareAtPrice = compareAtPriceStr ? parseFloat(compareAtPriceStr) : null;
    const stock = stockStr ? parseInt(stockStr, 10) : 0;
    
    // Generar SKU único si no fue especificado
    const sku = skuInput?.trim() ? skuInput.trim() : `GOSU-${Date.now().toString().slice(-6)}`;
    
    // Generar slug único a partir del título
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // Buscar o crear la categoría correspondiente
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: categoryName,
          slug: categorySlug,
          description: `Categoría para ${categoryName}`,
        },
      });
    }

    // Crear el producto en Neon DB con Prisma
    const newProduct = await prisma.product.create({
      data: {
        title,
        slug,
        description,
        basePrice,
        compareAtPrice,
        stock,
        sku,
        isActive: true,
        categoryId: category.id,
        // Crear la imagen asociada si se proporcionó una URL de Cloudinary
        images: imageUrl ? {
          create: [
            {
              url: imageUrl,
              publicId: imageUrl.split("/").pop() || "cloud_img",
              altText: title,
              position: 0,
            }
          ]
        } : undefined,
        // Crear una variante predeterminada
        variants: {
          create: [
            {
              name: "Estándar",
              sku: `${sku}-STD`,
              price: basePrice,
              stock: stock,
              imageUrl: imageUrl || null,
            }
          ]
        }
      },
      include: {
        images: true,
        category: true,
      }
    });

    // Revalidar rutas afectadas para reflejar cambios al instante
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    revalidatePath("/");

    return {
      success: true,
      product: {
        id: newProduct.id,
        title: newProduct.title,
        sku: newProduct.sku,
        price: newProduct.basePrice.toString(),
      }
    };
  } catch (error: any) {
    console.error("Error al crear producto:", error);
    return {
      success: false,
      error: error?.message || "Ocurrió un error inesperado al guardar el producto en Neon DB."
    };
  }
}
