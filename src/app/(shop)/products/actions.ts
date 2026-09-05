"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { awardLoyaltyPoints } from "@/lib/loyalty";
import { revalidatePath } from "next/cache";

export async function submitProductReviewAction(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return { success: false, error: "Debes iniciar sesión para publicar una reseña." };
    }

    const userId = (session.user as any).id;
    const productId = formData.get("productId") as string;
    const ratingStr = formData.get("rating") as string;
    const comment = formData.get("comment") as string;
    const imageUrl = formData.get("imageUrl") as string | null;

    if (!productId || !ratingStr || !comment) {
      return { success: false, error: "Por favor califica el producto e ingresa un comentario." };
    }

    const rating = Math.min(5, Math.max(1, parseInt(ratingStr, 10)));
    const trimmedComment = comment.trim();

    if (trimmedComment.length < 5) {
      return { success: false, error: "El comentario debe contener al menos 5 caracteres." };
    }

    // Verificar si el usuario ha comprado previamente este producto para la insignia "Compra Verificada"
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: "PAID",
        },
      },
    });

    const isVerifiedPurchase = !!verifiedPurchase;

    // Crear la reseña en Neon DB
    await prisma.productReview.create({
      data: {
        productId,
        userId,
        rating,
        comment: trimmedComment,
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
        isVerifiedPurchase,
        isApproved: true,
      },
    });

    // Desplegar motor de gamificación: Otorgar Puntos de Fidelidad por Reseña de Producto (PRODUCT_REVIEW)
    const pointsResult = await awardLoyaltyPoints(userId, "PRODUCT_REVIEW");

    revalidatePath(`/products/${productId}`);
    revalidatePath("/products");

    return {
      success: true,
      message: pointsResult.pointsAwarded > 0
        ? `¡Reseña publicada con éxito! Recibiste +${pointsResult.pointsAwarded} Puntos GOSU® Loyalty.`
        : "¡Reseña publicada con éxito!",
    };
  } catch (error: any) {
    console.error("Error al enviar reseña de producto:", error);
    return { success: false, error: error.message || "Error al guardar la reseña." };
  }
}
