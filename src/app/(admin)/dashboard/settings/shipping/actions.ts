"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRegionShippingMethodAction(formData: FormData): Promise<void> {
  try {
    const regionId = formData.get("regionId") as string;
    const name = formData.get("name") as string;
    const costStr = formData.get("cost") as string;
    const freeShippingThresholdStr = formData.get("freeShippingThreshold") as string;
    const targetZonesStr = formData.get("targetZones") as string;

    if (!regionId || !name || !costStr) return;

    const cost = parseFloat(costStr);
    const freeShippingThreshold = freeShippingThresholdStr ? parseFloat(freeShippingThresholdStr) : null;

    let targetZones: string[] | null = null;
    if (targetZonesStr && targetZonesStr.trim()) {
      try {
        targetZones = JSON.parse(targetZonesStr);
      } catch {
        targetZones = targetZonesStr.split(",").map((z) => z.trim()).filter(Boolean);
      }
    }

    await prisma.shippingMethod.create({
      data: {
        regionId,
        name,
        cost,
        freeShippingThreshold,
        targetZones: targetZones && targetZones.length > 0 ? targetZones : undefined,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al crear método de envío por región:", error);
  }
}

export async function updateShippingMethodAction(formData: FormData): Promise<void> {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const costStr = formData.get("cost") as string;
    const freeShippingThresholdStr = formData.get("freeShippingThreshold") as string;
    const targetZonesStr = formData.get("targetZones") as string;

    if (!id || !name || !costStr) return;

    const cost = parseFloat(costStr);
    const freeShippingThreshold = freeShippingThresholdStr ? parseFloat(freeShippingThresholdStr) : null;

    let targetZones: string[] | null = null;
    if (targetZonesStr && targetZonesStr.trim()) {
      try {
        targetZones = JSON.parse(targetZonesStr);
      } catch {
        targetZones = targetZonesStr.split(",").map((z) => z.trim()).filter(Boolean);
      }
    }

    await prisma.shippingMethod.update({
      where: { id },
      data: {
        name,
        cost,
        freeShippingThreshold,
        targetZones: targetZones && targetZones.length > 0 ? targetZones : undefined,
      },
    });

    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar método de envío:", error);
  }
}

export async function toggleShippingMethodActiveAction(id: string, isActive: boolean): Promise<void> {
  try {
    await prisma.shippingMethod.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error) {
    console.error("Error al cambiar estado del método de envío:", error);
  }
}

export async function toggleRegionActiveAction(regionId: string, isActive: boolean): Promise<void> {
  try {
    await prisma.regionConfig.update({
      where: { id: regionId },
      data: { isActive },
    });
    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error) {
    console.error("Error al cambiar estado de la región:", error);
  }
}

export async function saveLocalPickupAction(formData: FormData): Promise<void> {
  try {
    const regionId = formData.get("regionId") as string;
    const methodId = formData.get("methodId") as string | null;
    const isActive = formData.get("isActive") === "true";
    const pickupAddress = formData.get("pickupAddress") as string;
    const pickupSchedule = formData.get("pickupSchedule") as string;
    const name = (formData.get("name") as string) || "Recojo en Tienda";

    if (!regionId) return;

    if (methodId) {
      await prisma.shippingMethod.update({
        where: { id: methodId },
        data: {
          name,
          cost: 0,
          isPickup: true,
          pickupAddress,
          pickupSchedule,
          isActive,
        },
      });
    } else {
      await prisma.shippingMethod.create({
        data: {
          regionId,
          name,
          cost: 0,
          isPickup: true,
          pickupAddress,
          pickupSchedule,
          isActive,
        },
      });
    }

    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error) {
    console.error("Error al guardar método de Recojo en Tienda:", error);
  }
}

export async function deleteShippingMethodAction(id: string): Promise<void> {
  try {
    await prisma.shippingMethod.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath("/dashboard/settings/shipping");
    revalidatePath("/");
  } catch (error) {
    console.error("Error al inactivar método de envío:", error);
  }
}
