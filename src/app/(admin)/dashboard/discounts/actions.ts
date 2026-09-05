"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDiscountCodeAction(formData: FormData): Promise<void> {
  try {
    const codeStr = formData.get("code") as string;
    const type = (formData.get("type") as any) || "PERCENTAGE";
    const category = (formData.get("category") as any) || "PROMO";
    const valueStr = formData.get("value") as string;
    const minPurchaseStr = formData.get("minPurchaseAmount") as string;
    const commissionRateStr = formData.get("commissionRate") as string;
    const userEmail = formData.get("userEmail") as string;
    const usageLimitStr = formData.get("usageLimit") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;

    if (!codeStr || !valueStr) return;

    const code = codeStr.trim().toUpperCase();
    const value = parseFloat(valueStr);
    const minPurchaseAmount = minPurchaseStr ? parseFloat(minPurchaseStr) : null;
    const commissionRate = commissionRateStr ? parseFloat(commissionRateStr) : 10.0;
    const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    let createdById: string | null = null;

    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail.trim().toLowerCase() },
      });
      if (user) {
        createdById = user.id;
        if (user.role === "CUSTOMER") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "AFFILIATE" },
          });
        }
      }
    }

    await prisma.discountCode.create({
      data: {
        code,
        type,
        category,
        value,
        minPurchaseAmount,
        commissionRate,
        createdById,
        usageLimit,
        startDate,
        endDate,
        expiresAt: endDate,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/discounts");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al crear código de descuento o afiliado:", error);
  }
}

export async function toggleDiscountStatusAction(id: string): Promise<void> {
  try {
    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing) return;

    await prisma.discountCode.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/dashboard/discounts");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al alternar estado del cupón:", error);
  }
}

export async function payAffiliateCommissionAction(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { pendingCommission: 0.0 },
    });

    revalidatePath("/dashboard/discounts");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al marcar comisión como pagada:", error);
  }
}

export async function deleteDiscountCodeAction(id: string): Promise<void> {
  try {
    await prisma.discountCode.delete({
      where: { id },
    });

    revalidatePath("/dashboard/discounts");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al eliminar código de descuento:", error);
  }
}
