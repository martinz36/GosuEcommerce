"use server";

import { prisma } from "@/lib/prisma";

/**
 * Server Action para sincronizar silenciosamente la sesión del carrito abandonado en Neon DB.
 */
export async function syncCartSessionAction(
  sessionId: string,
  items: any[],
  subtotal: number,
  userEmail?: string | null
) {
  try {
    if (!sessionId || !process.env.DATABASE_URL) return { success: false };

    await prisma.cartSession.upsert({
      where: { sessionId: sessionId },
      update: {
        itemsJson: items,
        subtotal: subtotal,
        userEmail: userEmail || undefined,
        lastActiveAt: new Date(),
      },
      create: {
        sessionId: sessionId,
        itemsJson: items,
        subtotal: subtotal,
        userEmail: userEmail || undefined,
        isConverted: false,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error sincronizando sesión del carrito en Neon DB:", error);
    return { success: false };
  }
}

/**
 * Server Action para validar cupones de descuento y afiliados con reglas reales de Neon DB.
 */
export async function validateCouponAction(code: string, subtotal: number) {
  try {
    if (!code || !code.trim()) {
      return { success: false, error: "Por favor ingresa un código de descuento." };
    }

    const cleanCode = code.trim().toUpperCase();

    // 1. Consultar cupón en Neon Postgres mediante Prisma ORM
    let discountCode = null;
    try {
      if (process.env.DATABASE_URL) {
        discountCode = await prisma.discountCode.findUnique({
          where: { code: cleanCode },
        });
      }
    } catch (dbErr) {
      console.error("Error consultando cupones en Neon DB:", dbErr);
    }

    // 2. Respaldo para códigos de demostración si no existen aún en la base de datos
    if (!discountCode) {
      const demoCodes: Record<string, any> = {
        GOSU10: { code: "GOSU10", type: "PERCENTAGE", value: 10, minPurchaseAmount: 10, isActive: true },
        PROMO20: { code: "PROMO20", type: "PERCENTAGE", value: 20, minPurchaseAmount: 25, isActive: true },
        ALEX_TCG: { code: "ALEX_TCG", type: "FIXED_AMOUNT", value: 5, minPurchaseAmount: 15, isActive: true },
      };

      discountCode = demoCodes[cleanCode] || null;
    }

    if (!discountCode) {
      return { success: false, error: `El código "${cleanCode}" no existe o ha expirado.` };
    }

    // 3. Validar estado y reglas de negocio del cupón
    if (!discountCode.isActive) {
      return { success: false, error: "Este código de descuento se encuentra inactivo." };
    }

    if (discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date()) {
      return { success: false, error: "Este código de descuento ha expirado." };
    }

    if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
      return { success: false, error: "Este código ha alcanzado el límite máximo de usos." };
    }

    // 4. Validar compra mínima
    const minAmount = discountCode.minPurchaseAmount ? Number(discountCode.minPurchaseAmount) : 0;
    if (subtotal < minAmount) {
      return {
        success: false,
        error: `Este código requiere una compra mínima de $${minAmount.toFixed(2)}. (Subtotal actual: $${subtotal.toFixed(2)})`,
      };
    }

    // 5. Calcular monto de descuento y nuevo total
    const value = Number(discountCode.value);
    let discountAmount = 0;

    if (discountCode.type === "PERCENTAGE") {
      discountAmount = (subtotal * value) / 100;
      if (discountCode.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(discountCode.maxDiscountAmount));
      }
    } else if (discountCode.type === "FIXED_AMOUNT") {
      discountAmount = Math.min(subtotal, value);
    } else if (discountCode.type === "FREE_SHIPPING") {
      discountAmount = 0;
    }

    const finalDiscount = Number(discountAmount.toFixed(2));
    const newTotal = Math.max(0, subtotal - finalDiscount);

    return {
      success: true,
      discount: {
        code: discountCode.code,
        type: discountCode.type as "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING",
        value: value,
        discountAmount: finalDiscount,
        newTotal: Number(newTotal.toFixed(2)),
      },
    };
  } catch (error: any) {
    console.error("Error al validar código de descuento:", error);
    return { success: false, error: "Ocurrió un error al validar el código de descuento." };
  }
}
