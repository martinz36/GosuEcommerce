"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendAffiliateReportEmail, sendAffiliatePayoutEmail } from "@/lib/resend";

export async function createAffiliateAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const codeStr = formData.get("code") as string;
    const userEmail = formData.get("userEmail") as string;
    const commissionRateStr = formData.get("commissionRate") as string;
    const buyerDiscountStr = formData.get("buyerDiscount") as string;

    if (!codeStr || !userEmail) {
      return { success: false, error: "El código y el email del creador son obligatorios." };
    }

    const code = codeStr.trim().toUpperCase();
    const cleanEmail = userEmail.trim().toLowerCase();
    const commissionRate = commissionRateStr ? parseFloat(commissionRateStr) : 10.0;
    const buyerDiscount = buyerDiscountStr ? parseFloat(buyerDiscountStr) : 10.0;

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanEmail.split("@")[0],
          role: "AFFILIATE",
        },
      });
    } else if (user.role === "CUSTOMER" || user.role === "USER") {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: "AFFILIATE" },
      });
    }

    // Verificar si ya existe el código
    const existingCode = await prisma.discountCode.findUnique({
      where: { code },
    });

    if (existingCode) {
      return { success: false, error: `El código "${code}" ya está registrado.` };
    }

    await prisma.discountCode.create({
      data: {
        code,
        type: "PERCENTAGE",
        category: "AFFILIATE",
        value: buyerDiscount,
        commissionRate,
        createdById: user.id,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/affiliates");
    revalidatePath("/admin/affiliates");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Error al crear afiliado:", error);
    return { success: false, error: error.message || "Error al crear el afiliado." };
  }
}

export async function toggleAffiliateStatusAction(id: string): Promise<void> {
  try {
    const existing = await prisma.discountCode.findUnique({ where: { id } });
    if (!existing) return;

    await prisma.discountCode.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/dashboard/affiliates");
    revalidatePath("/admin/affiliates");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al alternar estado del afiliado:", error);
  }
}

export async function payAffiliateCommissionAction(userId: string, currency?: string): Promise<void> {
  try {
    if (currency) {
      const uppercaseCurrency = currency.toUpperCase();
      const unpaidLogs = await prisma.commissionLog.findMany({
        where: {
          affiliateId: userId,
          isPaid: false,
          order: {
            currency: uppercaseCurrency,
          },
        },
      });

      if (unpaidLogs.length > 0) {
        await prisma.commissionLog.updateMany({
          where: {
            id: { in: unpaidLogs.map((l) => l.id) },
          },
          data: {
            isPaid: true,
            paidAt: new Date(),
          },
        });
      }
    } else {
      await prisma.commissionLog.updateMany({
        where: {
          affiliateId: userId,
          isPaid: false,
        },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { pendingCommission: 0.0 },
      }).catch(() => {});
    }

    revalidatePath("/dashboard/affiliates");
    revalidatePath("/admin/affiliates");
    revalidatePath("/account/affiliate");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al marcar comisión como pagada:", error);
  }
}

export async function deleteAffiliateAction(id: string): Promise<void> {
  try {
    await prisma.discountCode.delete({
      where: { id },
    });

    revalidatePath("/dashboard/affiliates");
    revalidatePath("/admin/affiliates");
    revalidatePath("/");
  } catch (error: any) {
    console.error("Error al eliminar afiliado:", error);
  }
}

export async function sendAffiliateReportAction(discountCodeId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const code = await prisma.discountCode.findUnique({
      where: { id: discountCodeId },
      include: {
        createdBy: true,
        orders: {
          where: {
            status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] },
          },
        },
      },
    });

    if (!code || !code.createdBy) {
      return { success: false, error: "No se encontró el creador vinculado a este código de afiliado." };
    }

    const creator = code.createdBy;
    const paidOrders = (code.orders || []).filter((o: any) =>
      ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)
    );
    const totalOrders = paidOrders.length;

    let salesPEN = 0;
    let salesUSD = 0;
    let commPEN = 0;
    let commUSD = 0;
    const commissionRate = Number(code.commissionRate || 10.0);

    paidOrders.forEach((o: any) => {
      const amt = Number(o.totalAmount || 0);
      const curr = (o.currency || "PEN").toUpperCase();
      const comm = amt * (commissionRate / 100);
      if (curr === "USD") {
        salesUSD += amt;
        commUSD += comm;
      } else {
        salesPEN += amt;
        commPEN += comm;
      }
    });

    const resendResult = await sendAffiliateReportEmail({
      toEmail: creator.email,
      affiliateName: creator.name || `${creator.firstName || ""} ${creator.lastName || ""}`.trim() || creator.email,
      code: code.code,
      commissionRate,
      totalSalesPEN: salesPEN,
      totalSalesUSD: salesUSD,
      pendingCommissionPEN: commPEN,
      pendingCommissionUSD: commUSD,
      totalSales: salesPEN + salesUSD,
      pendingCommission: commPEN + commUSD,
      totalOrders,
    });

    if (resendResult.success) {
      return {
        success: true,
        message: `Reporte de estado de cuenta enviado exitosamente a ${creator.email}.`,
      };
    } else {
      return {
        success: false,
        error: resendResult.error || "No se pudo enviar el correo a través de Resend.",
      };
    }
  } catch (err: any) {
    console.error("Error enviando reporte por correo al afiliado:", err);
    return { success: false, error: err.message || "Error al enviar el reporte." };
  }
}

/**
 * Guardar / Actualizar datos bancarios del afiliado (BCP o Interbank)
 */
export async function saveAffiliateBankDetailsAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const codeId = formData.get("discountCodeId") as string;
    const userId = formData.get("userId") as string;
    const bankName = (formData.get("bankName") as string || "").trim();
    const accountNumber = (formData.get("accountNumber") as string || "").trim();
    const accountName = (formData.get("accountName") as string || "").trim();

    if (!bankName || (bankName !== "BCP" && bankName !== "Interbank")) {
      return { success: false, error: "El banco seleccionado debe ser BCP o Interbank." };
    }

    if (!accountNumber) {
      return { success: false, error: "El número de cuenta / CCI es obligatorio." };
    }

    let targetUserId = userId;

    if (!targetUserId && codeId) {
      const codeRecord = await prisma.discountCode.findUnique({
        where: { id: codeId },
        select: { createdById: true },
      });
      if (codeRecord?.createdById) {
        targetUserId = codeRecord.createdById;
      }
    }

    if (!targetUserId) {
      return { success: false, error: "No se encontró el usuario afiliado." };
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        bankName,
        accountNumber,
        accountName,
      },
    });

    revalidatePath("/dashboard/affiliates");
    if (codeId) revalidatePath(`/dashboard/affiliates/${codeId}`);
    revalidatePath("/creadores/portal");
    revalidatePath("/account/affiliate");

    return { success: true };
  } catch (err: any) {
    console.error("Error al guardar datos bancarios del afiliado:", err);
    return { success: false, error: err.message || "Error al actualizar datos bancarios." };
  }
}

/**
 * Procesar Liquidación de Comisiones (Payout) - Transferencia Bancaria o Crédito en Tienda
 */
export async function processAffiliatePayoutAction({
  discountCodeId,
  payoutMethod,
  currency = "PEN",
  amount,
  notes,
}: {
  discountCodeId: string;
  payoutMethod: "TRANSFER" | "STORE_CREDIT";
  currency?: string;
  amount: number;
  notes?: string;
}): Promise<{ success: boolean; message?: string; error?: string; storeCreditCode?: string }> {
  try {
    if (!discountCodeId) {
      return { success: false, error: "Código de afiliado no especificado." };
    }

    if (!amount || amount <= 0) {
      return { success: false, error: "El monto a liquidar debe ser mayor a 0." };
    }

    const codeRecord = await prisma.discountCode.findUnique({
      where: { id: discountCodeId },
      include: { createdBy: true },
    });

    if (!codeRecord || !codeRecord.createdBy) {
      return { success: false, error: "No se encontró el creador vinculado a este código de afiliado." };
    }

    const creator = codeRecord.createdBy;
    const uppercaseCurrency = (currency || "PEN").toUpperCase();

    let generatedStoreCreditCode: string | undefined = undefined;

    if (payoutMethod === "STORE_CREDIT") {
      const cleanEmailName = (creator.email.split("@")[0] || "GOSU").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      generatedStoreCreditCode = `CREDITO-${cleanEmailName}-${randomSuffix}`;

      await prisma.discountCode.create({
        data: {
          code: generatedStoreCreditCode,
          type: "FIXED_AMOUNT",
          category: "PROMO",
          value: amount,
          usageLimit: 1,
          isActive: true,
        },
      });
    }

    await prisma.payout.create({
      data: {
        affiliateId: creator.id,
        amount: amount,
        currency: uppercaseCurrency,
        payoutMethod: payoutMethod,
        bankName: creator.bankName || (payoutMethod === "TRANSFER" ? "BCP" : null),
        accountNumber: creator.accountNumber || null,
        accountName: creator.accountName || creator.name || creator.email,
        storeCreditCode: generatedStoreCreditCode || null,
        status: "COMPLETED",
        notes: notes || (payoutMethod === "TRANSFER" ? "Liquidación manual por transferencia bancaria" : `Crédito en tienda generado: ${generatedStoreCreditCode}`),
      },
    });

    const unpaidLogs = await prisma.commissionLog.findMany({
      where: {
        affiliateId: creator.id,
        isPaid: false,
        order: {
          currency: uppercaseCurrency,
        },
      },
    });

    if (unpaidLogs.length > 0) {
      await prisma.commissionLog.updateMany({
        where: {
          id: { in: unpaidLogs.map((l) => l.id) },
        },
        data: {
          isPaid: true,
          paidAt: new Date(),
        },
      });
    }

    await prisma.user.update({
      where: { id: creator.id },
      data: { pendingCommission: 0.00 },
    }).catch(() => {});

    await sendAffiliatePayoutEmail({
      toEmail: creator.email,
      affiliateName: creator.name || `${creator.firstName || ""} ${creator.lastName || ""}`.trim() || creator.email,
      code: codeRecord.code,
      amount,
      currency: uppercaseCurrency,
      payoutMethod,
      bankName: creator.bankName,
      accountNumber: creator.accountNumber,
      storeCreditCode: generatedStoreCreditCode,
    });

    revalidatePath("/dashboard/affiliates");
    revalidatePath(`/dashboard/affiliates/${discountCodeId}`);
    revalidatePath("/creadores/portal");
    revalidatePath("/account/affiliate");

    const msg = payoutMethod === "TRANSFER"
      ? `Liquidación de ${uppercaseCurrency === "USD" ? "$" : "S/."} ${amount.toFixed(2)} ${uppercaseCurrency} marcada como transferida exitosamente.`
      : `Crédito en tienda de ${uppercaseCurrency === "USD" ? "$" : "S/."} ${amount.toFixed(2)} ${uppercaseCurrency} generado con el código ${generatedStoreCreditCode}.`;

    return {
      success: true,
      message: msg,
      storeCreditCode: generatedStoreCreditCode,
    };
  } catch (err: any) {
    console.error("Error procesando liquidación de afiliado:", err);
    return { success: false, error: err.message || "Error al procesar la liquidación." };
  }
}
