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

    if (!codeStr || !valueStr) return;

    const code = codeStr.trim().toUpperCase();
    const value = parseFloat(valueStr);
    const minPurchaseAmount = minPurchaseStr ? parseFloat(minPurchaseStr) : null;
    const commissionRate = commissionRateStr ? parseFloat(commissionRateStr) : 10.0;

    let createdById: string | null = null;

    if (userEmail) {
      const user = await prisma.user.findUnique({
        where: { email: userEmail.trim().toLowerCase() },
      });
      if (user) {
        createdById = user.id;
        // Promover a rol AFILIADO
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
        isActive: true,
      },
    });

    revalidatePath("/dashboard/discounts");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al crear código de descuento o afiliado:", error);
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
