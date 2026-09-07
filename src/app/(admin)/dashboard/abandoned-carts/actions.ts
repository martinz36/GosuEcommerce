"use server";

import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/resend";
import { revalidatePath } from "next/cache";

export async function sendAbandonedCartReminderAction(cartSessionId: string) {
  try {
    if (!cartSessionId || !process.env.DATABASE_URL) {
      return { success: false, error: "ID de sesión de carrito inválido." };
    }

    const session = await (prisma as any).cartSession.findUnique({
      where: { id: cartSessionId },
    });

    if (!session || !session.userEmail) {
      return { success: false, error: "No se encontró el correo del usuario en este carrito." };
    }

    let items: any[] = [];
    if (Array.isArray(session.itemsJson)) {
      items = session.itemsJson;
    } else if (typeof session.itemsJson === "string") {
      try {
        items = JSON.parse(session.itemsJson);
      } catch {
        items = [];
      }
    }

    if (items.length === 0) {
      return { success: false, error: "El carrito no contiene productos." };
    }

    // Enviar correo transaccional estilizado con Resend
    const result = await sendAbandonedCartEmail({
      toEmail: session.userEmail,
      items: items.map((i: any) => ({
        title: i.title,
        quantity: i.quantity,
        price: Number(i.price || 0),
      })),
      subtotal: Number(session.subtotal || 0),
    });

    if (!result.success) {
      return { success: false, error: result.error || "Error al enviar el correo con Resend." };
    }

    revalidatePath("/dashboard/abandoned-carts");
    return { success: true, message: `Recordatorio enviado con éxito a ${session.userEmail}` };
  } catch (error: any) {
    console.error("Error al enviar recordatorio de carrito abandonado:", error);
    return { success: false, error: error.message || "Error al procesar el envío del recordatorio." };
  }
}
