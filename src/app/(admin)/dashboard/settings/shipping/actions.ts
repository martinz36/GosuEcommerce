"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRegionShippingMethodAction(formData: FormData): Promise<void> {
  try {
    const regionId = formData.get("regionId") as string;
    const name = formData.get("name") as string;
    const costStr = formData.get("cost") as string;
    const freeShippingThresholdStr = formData.get("freeShippingThreshold") as string;

    if (!regionId || !name || !costStr) return;

    const cost = parseFloat(costStr);
    const freeShippingThreshold = freeShippingThresholdStr ? parseFloat(freeShippingThresholdStr) : null;

    await prisma.shippingMethod.create({
      data: {
        regionId,
        name,
        cost,
        freeShippingThreshold,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al crear método de envío por región:", error);
  }
}

export async function deleteShippingMethodAction(id: string): Promise<void> {
  try {
    await prisma.shippingMethod.delete({
      where: { id },
    });
    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error) {
    console.error("Error al eliminar método de envío:", error);
  }
}
