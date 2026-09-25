"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface SubmitClaimResult {
  success: boolean;
  claimNumber?: string;
  claimData?: any;
  error?: string;
}

export async function submitClaimAction(formData: FormData): Promise<SubmitClaimResult> {
  try {
    const fullName = (formData.get("fullName") as string)?.trim();
    const documentType = (formData.get("documentType") as string) || "DNI";
    const documentNumber = (formData.get("documentNumber") as string)?.trim();
    const address = (formData.get("address") as string)?.trim();
    const phone = (formData.get("phone") as string)?.trim();
    const email = (formData.get("email") as string)?.trim();
    const isMinor = formData.get("isMinor") === "true" || formData.get("isMinor") === "on";
    const parentName = (formData.get("parentName") as string)?.trim() || null;
    const parentDocument = (formData.get("parentDocument") as string)?.trim() || null;

    const contractType = (formData.get("contractType") as any) || "PRODUCTO";
    const claimedAmountStr = (formData.get("claimedAmount") as string) || "0.00";
    const currency = (formData.get("currency") as string) || "PEN";
    const description = (formData.get("description") as string)?.trim();

    const claimType = (formData.get("claimType") as any) || "RECLAMO";
    const claimDetail = (formData.get("claimDetail") as string)?.trim();
    const consumerRequest = (formData.get("consumerRequest") as string)?.trim();

    // Validaciones estrictas
    if (!fullName || !documentNumber || !address || !phone || !email || !description || !claimDetail || !consumerRequest) {
      return {
        success: false,
        error: "Por favor complete todos los campos obligatorios (*).",
      };
    }

    if (isMinor && !parentName) {
      return {
        success: false,
        error: "Si el consumidor es menor de edad, debe ingresar el nombre del padre, madre o apoderado.",
      };
    }

    // Generar correlativo anual único: LR-2026-0001
    const currentYear = new Date().getFullYear();
    const count = await prisma.claimSheet.count();
    const sequence = String(count + 1).padStart(4, "0");
    const claimNumber = `LR-${currentYear}-${sequence}`;

    const newClaim = await prisma.claimSheet.create({
      data: {
        claimNumber,
        providerName: "MV INVESTMENTS S.A.C.",
        providerRuc: "20601338409",
        providerAddress: "JR. LOS CONQUISTADORES 154, SURCO, LIMA, PERU",
        fullName,
        documentType,
        documentNumber,
        address,
        phone,
        email,
        isMinor,
        parentName,
        parentDocument,
        contractType,
        claimedAmount: parseFloat(claimedAmountStr) || 0,
        currency,
        description,
        claimType,
        claimDetail,
        consumerRequest,
        status: "PENDING",
      },
    });

    revalidatePath("/dashboard/claims");
    revalidatePath("/libro-de-reclamaciones");

    return {
      success: true,
      claimNumber,
      claimData: {
        id: newClaim.id,
        claimNumber: newClaim.claimNumber,
        createdAt: newClaim.createdAt.toISOString(),
        fullName: newClaim.fullName,
        documentType: newClaim.documentType,
        documentNumber: newClaim.documentNumber,
        address: newClaim.address,
        phone: newClaim.phone,
        email: newClaim.email,
        contractType: newClaim.contractType,
        claimedAmount: Number(newClaim.claimedAmount),
        currency: newClaim.currency,
        description: newClaim.description,
        claimType: newClaim.claimType,
        claimDetail: newClaim.claimDetail,
        consumerRequest: newClaim.consumerRequest,
      },
    };
  } catch (error: any) {
    console.error("Error al registrar Hoja de Reclamación Virtual:", error);
    return {
      success: false,
      error: error?.message || "Ocurrió un error al procesar el reclamo. Inténtelo nuevamente.",
    };
  }
}
