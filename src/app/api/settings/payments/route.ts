import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ activePaymentGateway: "stripe" });
    }

    let settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: "default",
          activePaymentGateway: "stripe",
        },
      });
    }

    return NextResponse.json({
      activePaymentGateway: settings.activePaymentGateway || "stripe",
      storeName: settings.storeName,
      currency: settings.currency,
    });
  } catch (error: any) {
    console.error("Error al obtener ajustes de pago:", error);
    return NextResponse.json(
      { error: error.message || "Error al obtener la configuración." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const { activePaymentGateway } = body;

    if (!activePaymentGateway || !["stripe", "mercadopago"].includes(activePaymentGateway.toLowerCase())) {
      return NextResponse.json(
        { error: "La pasarela de pago debe ser 'stripe' o 'mercadopago'." },
        { status: 400 }
      );
    }

    const normalizedGateway = activePaymentGateway.toLowerCase();

    const updatedSettings = await prisma.storeSettings.upsert({
      where: { id: "default" },
      update: { activePaymentGateway: normalizedGateway },
      create: {
        id: "default",
        activePaymentGateway: normalizedGateway,
      },
    });

    return NextResponse.json({
      success: true,
      activePaymentGateway: updatedSettings.activePaymentGateway,
      message: `Pasarela de pago actualizada a ${normalizedGateway === "mercadopago" ? "Mercado Pago" : "Stripe"} exitosamente.`,
    });
  } catch (error: any) {
    console.error("Error al actualizar la pasarela de pago:", error);
    return NextResponse.json(
      { error: error.message || "Error al guardar la configuración." },
      { status: 500 }
    );
  }
}
