import React from "react";
import { prisma } from "@/lib/prisma";
import LoyaltySettingsClient from "./LoyaltySettingsClient";

export const revalidate = 0;

export default async function LoyaltySettingsPage() {
  let tiers: any[] = [];
  let rules: any[] = [];

  try {
    if (process.env.DATABASE_URL) {
      tiers = await prisma.loyaltyTier.findMany({
        orderBy: { minPoints: "asc" },
      });

      rules = await prisma.loyaltyEarningRule.findMany();
    }
  } catch (err) {
    console.error("Error al consultar configuración de Loyalty en Neon DB:", err);
  }

  const formattedTiers = tiers.map((t) => ({
    id: t.id,
    name: t.name,
    minPoints: t.minPoints,
    badgeImageUrl: t.badgeImageUrl,
    perks: t.perks,
  }));

  const formattedRules = rules.map((r) => ({
    id: r.id,
    actionType: r.actionType,
    pointsReward: r.pointsReward,
    isActive: r.isActive,
  }));

  return <LoyaltySettingsClient tiers={formattedTiers} rules={formattedRules} />;
}
