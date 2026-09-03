"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, status: any): Promise<void> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/account/orders");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar estado del pedido en Neon DB:", error);
  }
}

export async function updateOrderTrackingAction(orderId: string, formData: FormData): Promise<void> {
  try {
    const trackingNumber = formData.get("trackingNumber") as string;
    const trackingUrl = formData.get("trackingUrl") as string;

    if (!trackingNumber) return;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: trackingNumber.trim(),
        trackingUrl: trackingUrl ? trackingUrl.trim() : null,
        status: "SHIPPED",
      },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/account/orders");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al asignar código de seguimiento:", error);
  }
}
