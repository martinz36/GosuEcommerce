"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPromoCodeAction(formData: FormData): Promise<void> {
  try {
    const codeStr = formData.get("code") as string;
    const type = (formData.get("type") as any) || "PERCENTAGE";
    const valueStr = formData.get("value") as string;
    const minPurchaseStr = formData.get("minPurchaseAmount") as string;
    const usageLimitStr = formData.get("usageLimit") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!codeStr || !valueStr) return;

    const code = codeStr.trim().toUpperCase();
    const value = parseFloat(valueStr);
    const minPurchaseAmount = minPurchaseStr ? parseFloat(minPurchaseStr) : null;
    const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    await prisma.discountCode.create({
      data: {
        code,
        type,
        category: "PROMO",
        value,
        minPurchaseAmount,
        usageLimit,
        endDate,
        expiresAt: endDate,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/promotions");
    revalidatePath("/admin/promotions");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al crear código de descuento promocional:", error);
  }
}

export async function togglePromoStatusAction(id: string): Promise<void> {
  try {
    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing) return;

    await prisma.discountCode.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/dashboard/promotions");
    revalidatePath("/admin/promotions");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al alternar estado del cupón:", error);
  }
}

export async function deletePromoCodeAction(id: string): Promise<void> {
  try {
    await prisma.discountCode.delete({
      where: { id },
    });

    revalidatePath("/dashboard/promotions");
    revalidatePath("/admin/promotions");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al eliminar código de descuento:", error);
  }
}
