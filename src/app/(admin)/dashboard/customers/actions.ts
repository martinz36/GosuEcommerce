"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function adjustCustomerPointsAction(
  userId: string,
  pointsDelta: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    const currentPoints = user.loyaltyPoints || 0;
    const newPoints = Math.max(0, currentPoints + pointsDelta);

    await prisma.user.update({
      where: { id: userId },
      data: { loyaltyPoints: newPoints },
    });

    revalidatePath(`/dashboard/customers/${userId}`);
    revalidatePath("/dashboard/customers");
    revalidatePath("/account/dashboard");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error ajustando puntos de fidelidad:", error);
    return { success: false, error: error.message || "Error al ajustar puntos" };
  }
}

export async function addCustomerNoteAction(
  userId: string,
  content: string
): Promise<{ success: boolean; note?: any; error?: string }> {
  try {
    if (!content || !content.trim()) {
      return { success: false, error: "El contenido de la nota no puede estar vacío." };
    }

    const note = await prisma.customerNote.create({
      data: {
        userId,
        content: content.trim(),
      },
    });

    revalidatePath(`/dashboard/customers/${userId}`);
    return { success: true, note };
  } catch (error: any) {
    console.error("Error agregando nota de cliente:", error);
    return { success: false, error: error.message || "Error al agregar la nota" };
  }
}

export async function addCustomerTagAction(
  userId: string,
  tag: string
): Promise<{ success: boolean; tags?: string[]; error?: string }> {
  try {
    const cleanTag = tag.trim().toUpperCase();
    if (!cleanTag) {
      return { success: false, error: "La etiqueta no puede estar vacía." };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    const currentTags = user.tags || [];
    if (currentTags.includes(cleanTag)) {
      return { success: true, tags: currentTags };
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tags: {
          push: cleanTag,
        },
      },
    });

    revalidatePath(`/dashboard/customers/${userId}`);
    revalidatePath("/dashboard/customers");

    return { success: true, tags: updatedUser.tags };
  } catch (error: any) {
    console.error("Error agregando tag a cliente:", error);
    return { success: false, error: error.message || "Error al agregar el tag" };
  }
}

export async function removeCustomerTagAction(
  userId: string,
  tag: string
): Promise<{ success: boolean; tags?: string[]; error?: string }> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    const currentTags = user.tags || [];
    const newTags = currentTags.filter((t) => t !== tag);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tags: newTags,
      },
    });

    revalidatePath(`/dashboard/customers/${userId}`);
    revalidatePath("/dashboard/customers");

    return { success: true, tags: updatedUser.tags };
  } catch (error: any) {
    console.error("Error eliminando tag de cliente:", error);
    return { success: false, error: error.message || "Error al eliminar el tag" };
  }
}

export async function updateCustomerMarketingAddressAction(
  userId: string,
  data: { phone?: string; defaultShippingAddress?: string; acceptsMarketing?: boolean }
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: data.phone !== undefined ? data.phone : undefined,
        defaultShippingAddress: data.defaultShippingAddress !== undefined ? data.defaultShippingAddress : undefined,
        acceptsMarketing: data.acceptsMarketing !== undefined ? data.acceptsMarketing : undefined,
      },
    });

    revalidatePath(`/dashboard/customers/${userId}`);
    revalidatePath("/dashboard/customers");

    return { success: true };
  } catch (error: any) {
    console.error("Error actualizando datos de CRM del cliente:", error);
    return { success: false, error: error.message || "Error al actualizar datos" };
  }
}
