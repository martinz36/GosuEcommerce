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
    const isDefault = formData.get("isDefault") === "true";
    const isAutoExchangeRate = formData.get("isAutoExchangeRate") === "true";

    if (!countryCodeInput || !countryName) return;

    const countryCode = countryCodeInput.trim().toUpperCase();
    const exchangeRate = exchangeRateStr ? parseFloat(exchangeRateStr) : 1.0;

    if (isDefault) {
      await prisma.regionConfig.updateMany({
        data: { isDefault: false },
      });
    }

    await prisma.regionConfig.upsert({
      where: { countryCode },
      update: {
        countryName,
        currency,
        currencySymbol,
        exchangeRate,
        isActive: true,
        isDefault,
        isAutoExchangeRate,
      },
      create: {
        countryCode,
        countryName,
        currency,
        currencySymbol,
        exchangeRate,
        isActive: true,
        isDefault,
        isAutoExchangeRate,
      },
    });

    revalidatePath("/dashboard/settings/regions");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al guardar RegionConfig:", error);
  }
}

export async function updateRegionConfigAction(formData: FormData): Promise<void> {
  try {
    const id = formData.get("id") as string;
    const countryName = formData.get("countryName") as string;
    const currency = formData.get("currency") as string;
    const currencySymbol = formData.get("currencySymbol") as string;
    const exchangeRateStr = formData.get("exchangeRate") as string;
    const isActive = formData.get("isActive") === "true";
    const isDefault = formData.get("isDefault") === "true";
    const isAutoExchangeRate = formData.get("isAutoExchangeRate") === "true";

    if (!id || !countryName) return;

    const exchangeRate = exchangeRateStr ? parseFloat(exchangeRateStr) : 1.0;

    if (isDefault) {
      await prisma.regionConfig.updateMany({
        where: { id: { not: id } },
        data: { isDefault: false },
      });
    }

    await prisma.regionConfig.update({
      where: { id },
      data: {
        countryName,
        currency,
        currencySymbol,
        exchangeRate,
        isActive,
        isDefault,
        isAutoExchangeRate,
      },
    });

    revalidatePath("/dashboard/settings/regions");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al actualizar región:", error);
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

export async function setDefaultRegionAction(id: string): Promise<void> {
  try {
    await prisma.regionConfig.updateMany({
      data: { isDefault: false },
    });
    await prisma.regionConfig.update({
      where: { id },
      data: { isDefault: true, isActive: true },
    });
    revalidatePath("/dashboard/settings/regions");
    revalidatePath("/");
  } catch (error) {
    console.error("Error al marcar región por defecto:", error);
  }
}
