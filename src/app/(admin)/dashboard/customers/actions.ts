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
