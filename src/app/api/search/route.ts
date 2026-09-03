import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase();

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ results: [] });
    }

    const dbProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { uniqueId: { contains: query, mode: "insensitive" } },
          { familyId: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        images: true,
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    });

    const results = dbProducts.map((p) => {
      const priceUSD = Number(p.priceUSD || p.basePrice);
      const pricePEN = Number(p.pricePEN || (priceUSD * 3.75).toFixed(2));

      return {
        id: p.id,
        title: p.title,
        sku: p.sku,
        priceUSD,
        pricePEN,
        stock: p.stock,
        categoryName: p.category?.name || "General",
        imageUrl: p.images?.[0]?.url || null,
        isFamily: p.isFamily,
      };
    });

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Error en API de Búsqueda Predictiva:", error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
