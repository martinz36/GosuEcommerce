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
