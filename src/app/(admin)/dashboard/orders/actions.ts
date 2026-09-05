"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, status: string): Promise<void> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar estado del pedido en Neon DB:", error);
  }
}

export async function setOrderStatusProcessingAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "PROCESSING");
}

export async function setOrderStatusShippedAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "SHIPPED");
}

export async function setOrderStatusDeliveredAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "DELIVERED");
}

export async function setOrderStatusCancelledAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "CANCELLED");
}

export async function setOrderStatusRefundedAction(orderId: string): Promise<void> {
  return updateOrderStatusAction(orderId, "REFUNDED");
}

export async function updateOrderTrackingAction(orderId: string, formData: FormData): Promise<void> {
  try {
    const trackingNumber = (formData.get("trackingNumber") as string || "").trim();
    const trackingUrl = (formData.get("trackingUrl") as string || "").trim();
    const newStatus = (formData.get("status") as string || "").trim();

    const updateData: any = {};
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl || null;
    
    if (newStatus) {
      updateData.status = newStatus;
    } else if (trackingNumber && !newStatus) {
      updateData.status = "SHIPPED";
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/account/orders");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al asignar código de seguimiento:", error);
  }
}
