import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import CustomerDashboardClient from "./CustomerDashboardClient";

export const revalidate = 0;

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/account/login");
  }

  const userId = (session.user as any).id;

  let dbUser: any = null;
  let userOrdersCount = 0;
  let tiers: any[] = [];
  let rules: any[] = [];

  try {
    if (process.env.DATABASE_URL && userId) {
      dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          orders: true,
        },
      });

      if (dbUser) {
        userOrdersCount = dbUser.orders.length;
      }

      tiers = await prisma.loyaltyTier.findMany({
        orderBy: { minPoints: "asc" },
      });

      rules = await prisma.loyaltyEarningRule.findMany({
        where: { isActive: true },
      });
    }
  } catch (err) {
    console.error("Error al cargar datos de fidelización en CustomerDashboardPage:", err);
  }

  const userName: string = dbUser?.firstName
    ? `${dbUser.firstName} ${dbUser.lastName || ''}`.trim()
    : session.user.name || session.user.email?.split("@")[0] || "Cliente";

  const userEmail = dbUser?.email || session.user.email || "N/A";
  const loyaltyPoints = dbUser?.loyaltyPoints || 0;

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

  return (
    <CustomerDashboardClient
      userName={userName}
      userEmail={userEmail}
      userId={userId}
      loyaltyPoints={loyaltyPoints}
      userOrdersCount={userOrdersCount}
      birthdate={dbUser?.birthdate}
      phone={dbUser?.phone}
      isProfileCompleted={!!dbUser?.isProfileCompleted}
      tiers={formattedTiers}
      rules={formattedRules}
    />
  );
}
