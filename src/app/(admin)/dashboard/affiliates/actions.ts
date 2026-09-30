"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendAffiliateReportEmail } from "@/lib/resend";

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
        orders: true,
      },
    });

    if (!code || !code.createdBy) {
      return { success: false, error: "No se encontró el creador vinculado a este código de afiliado." };
    }

    const creator = code.createdBy;
    const totalOrders = code.orders ? code.orders.length : 0;

    let salesPEN = 0;
    let salesUSD = 0;
    let commPEN = 0;
    let commUSD = 0;
    const commissionRate = Number(code.commissionRate || 10.0);

    (code.orders || []).forEach((o) => {
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
