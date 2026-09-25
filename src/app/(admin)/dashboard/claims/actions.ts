"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function respondClaimAction(claimId: string, formData: FormData): Promise<void> {
  try {
    const providerAction = (formData.get("providerAction") as string)?.trim();
    const status = (formData.get("status") as any) || "RESPONDED";

    if (!providerAction) return;

    await prisma.claimSheet.update({
      where: { id: claimId },
      data: {
        providerAction,
        status,
        responseDate: new Date(),
      },
    });

    revalidatePath("/dashboard/claims");
    revalidatePath("/libro-de-reclamaciones");
  } catch (error: any) {
    console.error("Error al responder reclamo en Neon DB:", error);
  }
}
