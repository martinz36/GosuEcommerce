import React from "react";
import { Zap, CheckCircle2, Tag, Gift } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AddBundleToCartButton } from "./AddBundleToCartButton";

export async function BundleSection() {
  let dbBundles: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      dbBundles = await prisma.bundle.findMany({
        where: { isActive: true },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("Error consultando bundles de Neon DB:", err);
  }

  // Packs de respaldo si no hay creados en Neon DB aún
  const mockBundles = [
    {
      id: "bundle-pro-1",
      title: "PRO COLLECTOR PACK (3x Sleeves + 1x Binder + Deck Box)",
      description: "Equipamiento completo de nivel competitivo con ahorro exclusivo del 28%. Incluye 3 paquetes de fundas Matte, 1 carpeta Zip Armor de 9 bolsillos y 1 Deck Box magnética.",
      bundlePrice: 49.99,
      compareAtPrice: 69.99,
      imageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
      itemsList: [
        { id: "item-b1", title: "3x GOSU® Armor Sleeves Matte Black", price: 14.99 },
        { id: "item-b2", title: "1x Toploader Zip Binder 9-Pocket", price: 34.99 },
        { id: "item-b3", title: "1x Magnetic Deck Box 100+", price: 19.99 },
      ],
    },
  ];

  const displayBundles = dbBundles.length > 0
    ? dbBundles.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        bundlePrice: Number(b.bundlePrice),
        compareAtPrice: b.compareAtPrice ? Number(b.compareAtPrice) : null,
        imageUrl: b.imageUrl || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=60",
        itemsList: b.items.map((i: any) => ({
          id: i.product?.id || i.id,
          title: `${i.quantity}x ${i.product?.title || 'Accesorio TCG'}`,
          price: Number(i.product?.basePrice || 14.99),
          imageUrl: i.product?.images[0]?.url || null,
        })),
      }))
    : mockBundles;

  return (
    <section id="bundles" className="py-16 px-6 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-accent-pink text-xs font-mono mb-2">
            <Gift className="w-4 h-4" />
            <span>OFERTAS DE PACKS AGRUPADOS</span>
          </div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">PACKS & BUNDLES EXCLUSIVOS</h2>
          <p className="text-neutral-400 text-sm mt-1">
            Agrupa tus accesorios favoritos con descuento especial e insértalos al carrito con 1 solo clic.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {displayBundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-surface rounded-2xl border border-neutral-800 p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-pink/10 blur-[100px] pointer-events-none" />

            {/* Imagen del Pack */}
            <div className="lg:col-span-5 aspect-video md:aspect-square rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative">
              <img
                src={bundle.imageUrl}
                alt={bundle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-accent-pink text-white uppercase tracking-wider shadow-md">
                  AHORRA HASTA 28%
                </span>
              </div>
            </div>

            {/* Contenido e Ítems del Pack */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-accent-cyan uppercase tracking-widest block mb-1">
                  PACK RECOMENDADO
                </span>
                <h3 className="text-2xl md:text-4xl font-extrabold uppercase leading-tight">
                  {bundle.title}
                </h3>
                <p className="text-neutral-300 text-sm mt-2 leading-relaxed">
                  {bundle.description}
                </p>
              </div>

              {/* Lista de Productos Incluidos en el Pack */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider block mb-1">
                  Productos incluidos en este Pack:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {bundle.itemsList.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-200 bg-black/60 px-3 py-2 rounded-lg border border-neutral-800">
                      <CheckCircle2 className="w-4 h-4 text-accent-cyan shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Precios y Botón de Agregación Zustand en 1 Clic */}
              <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-neutral-400 font-mono block">Precio del Bundle:</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-white">${bundle.bundlePrice.toFixed(2)}</span>
                    {bundle.compareAtPrice && (
                      <span className="text-lg text-neutral-500 line-through font-mono">
                        ${bundle.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <AddBundleToCartButton
                  bundleId={bundle.id}
                  bundleTitle={bundle.title}
                  bundlePrice={bundle.bundlePrice}
                  items={bundle.itemsList}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
