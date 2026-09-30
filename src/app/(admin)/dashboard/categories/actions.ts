"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const name = (formData.get("name") as string || "").trim();
    const rawSlug = (formData.get("slug") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();

    if (!name) {
      return { success: false, error: "El nombre de la categoría es obligatorio." };
    }

    const slug = rawSlug
      ? rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const existingSlug = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return { success: false, error: `El slug "${slug}" ya está registrado por otra categoría.` };
    }

    await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/new");
    revalidatePath("/catalog");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    return { success: false, error: error?.message || "Error al crear la categoría." };
  }
}

export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const name = (formData.get("name") as string || "").trim();
    const rawSlug = (formData.get("slug") as string || "").trim();
    const description = (formData.get("description") as string || "").trim();

    if (!name) {
      return { success: false, error: "El nombre de la categoría es obligatorio." };
    }

    const slug = rawSlug
      ? rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const existingSlug = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existingSlug) {
      return { success: false, error: `El slug "${slug}" ya está registrado por otra categoría.` };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/new");
    revalidatePath("/catalog");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar categoría:", error);
    return { success: false, error: error?.message || "Error al actualizar la categoría." };
  }
}

export async function deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar esta categoría porque tiene ${productsCount} ${
          productsCount === 1 ? "producto asignado" : "productos asignados"
        }. Reasigna los productos primero.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/new");
    revalidatePath("/catalog");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar categoría:", error);
    return { success: false, error: error?.message || "Error al eliminar la categoría." };
  }
}

export async function assignProductsToCategoryAction(
  categoryId: string,
  productIdsToAssign: string[]
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const targetCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!targetCategory) {
      return { success: false, error: "La categoría seleccionada no existe." };
    }

    // 1. Obtener productos actualmente en esta categoría
    const currentProducts = await prisma.product.findMany({
      where: { categoryId },
      select: { id: true },
    });
    const currentIds = currentProducts.map((p) => p.id);

    // Productos desmarcados (estaban en esta categoría pero ya no)
    const idsToRemove = currentIds.filter((id) => !productIdsToAssign.includes(id));

    // Si hay productos a desmarcar, reasignar a categoría por defecto "Sin Categoría"
    if (idsToRemove.length > 0) {
      let defaultCat = await prisma.category.findFirst({
        where: { name: { equals: "Sin Categoría", mode: "insensitive" } },
      });

      if (!defaultCat) {
        defaultCat = await prisma.category.create({
          data: {
            name: "Sin Categoría",
            slug: "sin-categoria",
            description: "Categoría por defecto para productos desasignados",
          },
        });
      }

      await prisma.product.updateMany({
        where: { id: { in: idsToRemove } },
        data: { categoryId: defaultCat.id },
      });
    }

    // 2. Asignar productos seleccionados a la categoría destino
    if (productIdsToAssign.length > 0) {
      await prisma.product.updateMany({
        where: { id: { in: productIdsToAssign } },
        data: { categoryId: targetCategory.id },
      });
    }

    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/new");
    revalidatePath("/catalog");
    revalidatePath("/");

    return {
      success: true,
      count: productIdsToAssign.length,
    };
  } catch (error: any) {
    console.error("Error al asignar productos a la categoría:", error);
    return { success: false, error: error?.message || "Error al asignar productos a la categoría." };
  }
}
