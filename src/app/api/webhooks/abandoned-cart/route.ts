import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail } from "@/lib/resend";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { sessionId, email } = body;
    console.log("[Webhook Carrito Abandonado] Recibida petición POST:", { sessionId, email });

    let targetSession: any = null;

    if (sessionId) {
      targetSession = await prisma.cartSession.findUnique({
        where: { sessionId },
      });
    } else if (email) {
      targetSession = await prisma.cartSession.findFirst({
        where: { userEmail: email, isConverted: false },
        orderBy: { lastActiveAt: "desc" },
      });
    } else {
      // Tomar la sesión de carrito abandonado más reciente con correo
      targetSession = await prisma.cartSession.findFirst({
        where: {
          isConverted: false,
          userEmail: { not: null },
        },
        orderBy: { lastActiveAt: "desc" },
      });
    }

    if (!targetSession || !targetSession.userEmail) {
      console.warn("[Webhook Carrito Abandonado] No se encontró ninguna sesión de carrito con correo para recuperar.");
      return NextResponse.json(
        { success: false, message: "No se encontró ningún carrito abandonado con email para enviar recordatorio." },
        { status: 404 }
      );
    }

    let items: any[] = [];
    if (Array.isArray(targetSession.itemsJson)) {
      items = targetSession.itemsJson;
    } else if (typeof targetSession.itemsJson === "string") {
      try {
        items = JSON.parse(targetSession.itemsJson);
      } catch {
        items = [];
      }
    }

    console.log(
      `[Webhook Carrito Abandonado] Disparando función de Resend para ${targetSession.userEmail} (${items.length} productos)...`
    );

    const emailResult = await sendAbandonedCartEmail({
      toEmail: targetSession.userEmail,
      items: items.map((i: any) => ({
        title: i.title || "Producto TCG",
        quantity: Number(i.quantity || 1),
        price: Number(i.price || 0),
      })),
      subtotal: Number(targetSession.subtotal || 0),
    });

    return NextResponse.json({
      success: true,
      message: `Función/Webhook de Resend ejecutado exitosamente para ${targetSession.userEmail}`,
      sessionId: targetSession.sessionId,
      userEmail: targetSession.userEmail,
      itemsCount: items.length,
      subtotal: targetSession.subtotal,
      resendResult: emailResult,
    });
  } catch (error: any) {
    console.error("[Webhook Carrito Abandonado] Error:", error);
    return NextResponse.json(
      { error: error.message || "Error al procesar webhook de carrito abandonado." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  // Permitir GET para pruebas de verificación directas desde navegador
  return POST(req);
}
