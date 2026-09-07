import React from "react";
import { prisma } from "@/lib/prisma";
import { CatalogContainer } from "@/components/CatalogContainer";

export const revalidate = 0;

interface CatalogPageProps {
  searchParams: {
    search?: string;
    category?: string;
    color?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const currentPage = Math.max(1, parseInt(searchParams?.page || "1", 10));
  const ITEMS_PER_PAGE = 12;
  const takeLimit = ITEMS_PER_PAGE * currentPage;

  let products: any[] = [];
  let totalCount = 0;
  let categories: { id: string; name: string; slug: string }[] = [];

  try {
    if (process.env.DATABASE_URL) {
      // 1. Obtener todas las categorías para el sidebar
      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      });

      // 2. Construir la consulta 'where' con los filtros de la URL
      const whereClause: any = {
        isActive: true,
      };

      // Filtro por Búsqueda (Título)
      if (searchParams?.search) {
        whereClause.title = {
          contains: searchParams.search,
          mode: "insensitive",
        };
      }

      // Filtro por Categoría (slug)
      if (searchParams?.category) {
        const categorySlugs = searchParams.category.split(",");
        whereClause.category = {
          slug: { in: categorySlugs },
        };
      }

      // Filtro por Color (Título o Descripción conteniendo el nombre del color)
      if (searchParams?.color) {
        const colorName = searchParams.color;
        whereClause.OR = [
          { title: { contains: colorName, mode: "insensitive" } },
          { description: { contains: colorName, mode: "insensitive" } },
        ];
      }

      // Filtro por Rango de Precio
      if (searchParams?.minPrice || searchParams?.maxPrice) {
        const min = searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined;
        const max = searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined;

        const priceConditions: any[] = [];
        if (min !== undefined || max !== undefined) {
          priceConditions.push(
            { priceUSD: { gte: min, lte: max } },
            { pricePEN: { gte: min, lte: max } },
            { basePrice: { gte: min, lte: max } }
          );
        }
        whereClause.OR = whereClause.OR
          ? [...whereClause.OR, ...priceConditions]
          : priceConditions;
      }

      // 3. Ejecutar conteo total de coincidencia para la paginación
      totalCount = await prisma.product.count({ where: whereClause });

      // 4. Ejecutar consulta de productos acumulativos hasta takeLimit
      products = await prisma.product.findMany({
        where: whereClause,
        take: takeLimit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          images: { orderBy: { position: "asc" } },
        },
      });
    }
  } catch (err) {
    console.error("Error al consultar productos del catálogo en Neon DB:", err);
  }

  // Fallback de demostración si la base de datos no contiene productos aún
  if (products.length === 0 && !searchParams?.search && !searchParams?.category && !searchParams?.color) {
    const demoProducts = [
      {
        id: "demo-1",
        title: "GOSU® Armor Sleeves - Matte Black",
        description: "Protectores mate anti-reflejo para torneo.",
        priceUSD: 14.99,
        pricePEN: 56.00,
        basePrice: 14.99,
        stock: 15,
        category: { id: "cat-1", name: "Sleeves", slug: "sleeves" },
        images: [{ url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" }],
      },
      {
        id: "demo-2",
        title: "GOSU® Premium 9-Pocket Zip Binder - Purple",
        description: "Carpeta de 9 bolsillos con cierre zip reforzado.",
        priceUSD: 34.99,
        pricePEN: 130.00,
        basePrice: 34.99,
        stock: 8,
        category: { id: "cat-2", name: "Binders", slug: "binders" },
        images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=60" }],
      },
      {
        id: "demo-3",
        title: "GOSU® Magnetic Deck Box 100+ - Red",
        description: "Caja magnética de cuero vegano para 100+ cartas.",
        priceUSD: 24.99,
        pricePEN: 93.00,
        basePrice: 24.99,
        stock: 2,
        category: { id: "cat-3", name: "Deck Boxes", slug: "deck-boxes" },
        images: [{ url: "https://images.unsplash.com/photo-1589241062272-c0a000072dfa?w=800&auto=format&fit=crop&q=60" }],
      },
      {
        id: "demo-4",
        title: "GOSU® Pro Playmat - Cyberpunk City",
        description: "Tapete de hule de neopreno con bordes cosidos.",
        priceUSD: 19.99,
        pricePEN: 75.00,
        basePrice: 19.99,
        stock: 20,
        category: { id: "cat-4", name: "Playmats", slug: "playmats" },
        images: [{ url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=60" }],
      },
    ];

    products = demoProducts.slice(0, takeLimit);
    totalCount = demoProducts.length;

    if (categories.length === 0) {
      categories = [
        { id: "cat-1", name: "Sleeves", slug: "sleeves" },
        { id: "cat-2", name: "Binders", slug: "binders" },
        { id: "cat-3", name: "Deck Boxes", slug: "deck-boxes" },
        { id: "cat-4", name: "Playmats", slug: "playmats" },
      ];
    }
  }

  return (
    <CatalogContainer
      products={products}
      categories={categories}
      totalCount={totalCount}
      currentPage={currentPage}
    />
  );
}
