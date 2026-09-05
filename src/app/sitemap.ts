import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Revalidar sitemap cada 1 hora

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gosuecommerce.vercel.app";

  let productUrls: MetadataRoute.Sitemap = [];

  try {
    if (process.env.DATABASE_URL) {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: {
          id: true,
          slug: true,
          updatedAt: true,
        },
      });

      productUrls = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug || product.id}`,
        lastModified: product.updatedAt || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("Error al generar sitemap con productos de Neon DB:", err);
  }

  // Rutas estáticas públicas de la tienda
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/account/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/account/dashboard`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ];

  return [...staticRoutes, ...productUrls];
}
