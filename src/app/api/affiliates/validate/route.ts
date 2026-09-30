import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const codeStr = searchParams.get("code") || "";

    if (!codeStr) {
      return NextResponse.json(
        { isValid: false, error: "El código no fue proporcionado." },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { isValid: false, error: "Sin conexión a base de datos." },
        { status: 500 }
      );
    }

    const code = codeStr.trim().toUpperCase();

    // Buscar código de cupón de afiliado activo en Neon DB
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code,
        isActive: true,
      },
      include: {
        createdBy: true,
      },
    });

    if (!discountCode) {
      return NextResponse.json({
        isValid: false,
        error: `El código "${code}" no existe o se encuentra inactivo.`,
      });
    }

    const creatorName = discountCode.createdBy
      ? discountCode.createdBy.name ||
        `${discountCode.createdBy.firstName || ""} ${discountCode.createdBy.lastName || ""}`.trim() ||
        discountCode.createdBy.email.split("@")[0]
      : discountCode.code;

    return NextResponse.json({
      isValid: true,
      code: discountCode.code,
      type: discountCode.type,
      value: Number(discountCode.value),
      creatorName,
    });
  } catch (error: any) {
    console.error("Error al validar código de afiliado en API:", error);
    return NextResponse.json(
      { isValid: false, error: error.message || "Error interno al validar código." },
      { status: 500 }
    );
  }
}
