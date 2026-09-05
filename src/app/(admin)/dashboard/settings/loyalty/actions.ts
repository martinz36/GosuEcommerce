"use server";

import { prisma } from "@/lib/prisma";
import { LoyaltyActionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertLoyaltyTierAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const id = formData.get("id") as string | null;
    const name = formData.get("name") as string;
    const minPointsStr = formData.get("minPoints") as string;
    const badgeImageUrl = formData.get("badgeImageUrl") as string;
    const perks = formData.get("perks") as string;

    if (!name || minPointsStr === null || minPointsStr === undefined) {
      return { success: false, error: "El nombre del nivel y los puntos mínimos son obligatorios." };
    }

    const minPoints = parseInt(minPointsStr, 10);

    if (id && id.trim()) {
      await prisma.loyaltyTier.update({
        where: { id },
        data: {
          name,
          minPoints,
          badgeImageUrl: badgeImageUrl ? badgeImageUrl.trim() : null,
          perks: perks ? perks.trim() : null,
        },
      });
    } else {
      await prisma.loyaltyTier.create({
        data: {
          name,
          minPoints,
          badgeImageUrl: badgeImageUrl ? badgeImageUrl.trim() : null,
          perks: perks ? perks.trim() : null,
        },
      });
    }

    revalidatePath("/dashboard/settings/loyalty");
    revalidatePath("/account/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error al guardar nivel de fidelización:", error);
    return { success: false, error: error.message || "Error al guardar el nivel" };
  }
}

export async function deleteLoyaltyTierAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.loyaltyTier.delete({ where: { id } });
    revalidatePath("/dashboard/settings/loyalty");
    revalidatePath("/account/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar nivel de fidelización:", error);
    return { success: false, error: error.message || "Error al eliminar nivel" };
  }
}

export async function updateLoyaltyRuleAction(
  actionType: LoyaltyActionType,
  pointsReward: number,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.loyaltyEarningRule.upsert({
      where: { actionType },
      update: {
        pointsReward,
        isActive,
      },
      create: {
        actionType,
        pointsReward,
        isActive,
      },
    });

    revalidatePath("/dashboard/settings/loyalty");
    revalidatePath("/account/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error(`Error al actualizar regla de gamificación ${actionType}:`, error);
    return { success: false, error: error.message || "Error al actualizar la regla" };
  }
}

export async function seedDefaultLoyaltyConfigAction(): Promise<{ success: boolean }> {
  try {
    // 1. Sembrar niveles por defecto si no existen
    const existingTiers = await prisma.loyaltyTier.count();
    if (existingTiers === 0) {
      await prisma.loyaltyTier.createMany({
        data: [
          {
            name: "Contender 🥉",
            minPoints: 0,
            perks: "Acceso general a la tienda y 2.5% de cashback en puntos GOSU® por cada compra.",
            badgeImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
          },
          {
            name: "Meta Player 🥈",
            minPoints: 300,
            perks: "Sorteos exclusivos mensuales, doble acumulación de puntos en productos destacados TCG.",
            badgeImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
          },
          {
            name: "GOSU Champion 🥇",
            minPoints: 1000,
            perks: "Acceso anticipado a drops raros y preventas, invitaciones a torneos VIP y envío gratis garantizado.",
            badgeImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
          },
        ],
      });
    }

    // 2. Sembrar reglas por defecto si no existen
    const defaultRules: { actionType: LoyaltyActionType; pointsReward: number; isActive: boolean }[] = [
      { actionType: "ACCOUNT_CREATION", pointsReward: 50, isActive: true },
      { actionType: "PURCHASE", pointsReward: 1, isActive: true },
      { actionType: "PROFILE_COMPLETION", pointsReward: 20, isActive: true },
      { actionType: "PRODUCT_REVIEW", pointsReward: 15, isActive: true },
      { actionType: "BIRTHDAY", pointsReward: 100, isActive: true },
    ];

    for (const rule of defaultRules) {
      await prisma.loyaltyEarningRule.upsert({
        where: { actionType: rule.actionType },
        update: {},
        create: rule,
      });
    }

    revalidatePath("/dashboard/settings/loyalty");
    revalidatePath("/account/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al sembrar configuración predeterminada de Loyalty:", error);
    return { success: false };
  }
}
