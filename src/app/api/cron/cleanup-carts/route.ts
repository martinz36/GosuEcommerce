import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // 1. Validar Seguridad Bearer Token para Vercel Cron Jobs
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "No autorizado. Token de cron inválido." },
        { status: 401 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, message: "Sin conexión a base de datos." });
    }

    // 2. Calcular límite de antigüedad (24 horas atrás)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // 3. Buscar todas las sesiones de más de 24 horas y filtrar carritos obsoletos
    const candidateSessions = await (prisma as any).cartSession.findMany({
      where: {
        isConverted: false,
        lastActiveAt: {
          lt: twentyFourHoursAgo,
        },
      },
    });

    const sessionIdsToDelete: string[] = candidateSessions
      .filter((s: any) => {
        // Sin correo asociado (ni userEmail ni userId)
        const isAnonymous = !s.userEmail && !s.userId;

        // O Carrito Vacío (0 productos)
        let itemsCount = 0;
        if (Array.isArray(s.itemsJson)) {
          itemsCount = s.itemsJson.length;
        } else if (typeof s.itemsJson === "string") {
          try {
            itemsCount = JSON.parse(s.itemsJson).length;
          } catch {
            itemsCount = 0;
          }
        }

        const isEmpty = itemsCount === 0;

        // Se elimina si está vacío O no tiene correo
        return isAnonymous || isEmpty;
      })
      .map((s: any) => s.id);

    let deletedCount = 0;
    if (sessionIdsToDelete.length > 0) {
      const deleteResult = await (prisma as any).cartSession.deleteMany({
        where: {
          id: {
            in: sessionIdsToDelete,
          },
        },
      });
      deletedCount = deleteResult.count;
    }

    return NextResponse.json({
      success: true,
      message: `Limpieza de carritos abandonados obsoletos completada.`,
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error en Vercel Cron Job de limpieza de carritos:", error);
    return NextResponse.json(
      { error: error.message || "Error al ejecutar la limpieza de carritos." },
      { status: 500 }
    );
  }
}
