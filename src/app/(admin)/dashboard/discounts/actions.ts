"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDiscountCodeAction(formData: FormData): Promise<void> {
  try {
    const codeInput = formData.get("code") as string;
    const type = (formData.get("type") as string) || "PERCENTAGE";
    const category = (formData.get("category") as string) || "PROMO";
    const valueStr = formData.get("value") as string;
    const minPurchaseStr = formData.get("minPurchaseAmount") as string;
    const usageLimitStr = formData.get("usageLimit") as string;
    const expiresAtStr = formData.get("expiresAt") as string;
    const commissionRateStr = formData.get("commissionRate") as string;

    if (!codeInput || !valueStr) return;

    const code = codeInput.trim().toUpperCase();
    const value = parseFloat(valueStr);
    const minPurchaseAmount = minPurchaseStr ? parseFloat(minPurchaseStr) : null;
    const usageLimit = usageLimitStr ? parseInt(usageLimitStr, 10) : null;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;
    const commissionRate = commissionRateStr ? parseFloat(commissionRateStr) : 10.0;

    await prisma.discountCode.create({
      data: {
        code,
        type: type as any,
        category: category as any,
        value,
        minPurchaseAmount,
        usageLimit,
        expiresAt,
        commissionRate,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/discounts");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al crear código de descuento:", error);
  }
}
