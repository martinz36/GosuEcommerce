"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRegionConfigAction(formData: FormData): Promise<void> {
  try {
    const countryCodeInput = formData.get("countryCode") as string;
    const countryName = formData.get("countryName") as string;
    const currency = (formData.get("currency") as string) || "USD";
    const currencySymbol = (formData.get("currencySymbol") as string) || "$";
    const exchangeRateStr = formData.get("exchangeRate") as string;

    if (!countryCodeInput || !countryName) return;

    const countryCode = countryCodeInput.trim().toUpperCase();
    const exchangeRate = exchangeRateStr ? parseFloat(exchangeRateStr) : 1.0;

    await prisma.regionConfig.upsert({
      where: { countryCode: countryCode },
      update: {
        countryName,
        currency,
        currencySymbol,
        exchangeRate,
        isActive: true,
      },
      create: {
        countryCode,
        countryName,
        currency,
        currencySymbol,
        exchangeRate,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/settings/regions");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al guardar RegionConfig:", error);
  }
}

export async function toggleRegionActiveAction(id: string): Promise<void> {
  try {
    const existing = await prisma.regionConfig.findUnique({ where: { id } });
    if (existing) {
      await prisma.regionConfig.update({
        where: { id },
        data: { isActive: !existing.isActive },
      });
      revalidatePath("/dashboard/settings/regions");
      revalidatePath("/");
    }
  } catch (error) {
    console.error("Error al alternar estado de región:", error);
  }
}
