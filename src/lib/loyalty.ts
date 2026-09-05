import { prisma } from "@/lib/prisma";
import { LoyaltyActionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function awardLoyaltyPoints(
  userId: string,
  actionType: LoyaltyActionType,
  orderValue?: number
): Promise<{ success: boolean; pointsAwarded: number; message?: string }> {
  try {
    if (!userId) {
      return { success: false, pointsAwarded: 0, message: "ID de usuario inv\u00e1lido." };
    }

    // Consultar regla de ganancia en Neon DB
    const rule = await prisma.loyaltyEarningRule.findUnique({
      where: { actionType },
    });

    if (!rule || !rule.isActive) {
      return { success: false, pointsAwarded: 0, message: "Regla inactiva o no configurada." };
    }

    let pointsToAward = rule.pointsReward;

    // L\u00f3gica especial para compras seg\u00fan el monto gastado
    if (actionType === "PURCHASE" && orderValue && orderValue > 0) {
      const multiplier = rule.pointsReward > 0 ? rule.pointsReward : 1;
      pointsToAward = Math.floor(orderValue * multiplier);
    }

    if (pointsToAward <= 0) {
      return { success: false, pointsAwarded: 0, message: "Sin puntos a otorgar." };
    }

    // Actualizar puntos del usuario de forma at\u00f3mica
    await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: pointsToAward,
        },
      },
    });

    revalidatePath("/account/dashboard");
    revalidatePath("/dashboard/customers");

    return {
      success: true,
      pointsAwarded: pointsToAward,
      message: `\u00a1Recibiste +${pointsToAward} Puntos GOSU\u00ae!`,
    };
  } catch (error: any) {
    console.error(`Error otorgando puntos para acci\u00f3n ${actionType}:`, error);
    return { success: false, pointsAwarded: 0, message: error.message };
  }
}
