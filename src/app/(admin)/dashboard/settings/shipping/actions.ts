"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateStoreSettingsAction(formData: FormData): Promise<void> {
  try {
    const freeShippingThresholdStr = formData.get("freeShippingThreshold") as string;
    const standardShippingCostStr = formData.get("standardShippingCost") as string;

    const freeShippingThreshold = parseFloat(freeShippingThresholdStr || "50.00");
    const standardShippingCost = parseFloat(standardShippingCostStr || "4.99");

    await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: {
        freeShippingThreshold,
        standardShippingCost,
      },
      create: {
        id: "default",
        freeShippingThreshold,
        standardShippingCost,
      },
    });

    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar StoreSettings:", error);
  }
}

export async function createShippingMethodAction(formData: FormData): Promise<void> {
  try {
    const name = formData.get("name") as string;
    const costStr = formData.get("cost") as string;
    const minPurchaseStr = formData.get("minPurchaseForFree") as string;

    if (!name || !costStr) return;

    const cost = parseFloat(costStr);
    const minPurchaseForFree = minPurchaseStr ? parseFloat(minPurchaseStr) : null;

    await prisma.shippingMethod.create({
      data: {
        name,
        cost,
        minPurchaseForFree,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/settings/shipping");
  } catch (error: any) {
    console.error("Error al crear método de envío:", error);
  }
}
