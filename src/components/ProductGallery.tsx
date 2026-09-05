"use client";

import React, { useState, useRef } from "react";
import { Image as ImageIcon, Layers, PlayCircle } from "lucide-react";

interface ProductGalleryProps {
  images: { id?: string; url: string; position?: number }[];
  title: string;
  categoryName?: string;
  isFamily?: boolean;
}

export function ProductGallery({ images, title, categoryName, isFamily }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<{ opacity: number; transformOrigin?: string; scale?: number }>({
    opacity: 0,
  });

  const activeMedia = images?.[selectedIndex]?.url || null;
  const isVideo = activeMedia ? activeMedia.endsWith(".mp4") || activeMedia.includes("/video/upload/") : false;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVideo || !containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      opacity: 1,
      transformOrigin: `${x}% ${y}%`,
      scale: 2,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ opacity: 0, scale: 1 });
  };

  return (
    <div className="space-y-4">
      {/* Visualizador Principal con Lupa (Magnifier) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-surface rounded-2xl border border-neutral-800 overflow-hidden relative aspect-square flex items-center justify-center shadow-2xl cursor-crosshair group"
      >
        {activeMedia ? (
          isVideo ? (
            <video
              src={activeMedia}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={activeMedia}
              alt={title}
              style={{
                transformOrigin: zoomStyle.transformOrigin || "center center",
                transform: zoomStyle.scale ? `scale(${zoomStyle.scale})` : "scale(1)",
                transition: zoomStyle.scale ? "none" : "transform 0.3s ease-out",
              }}
              className="w-full h-full object-cover pointer-events-none"
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-3 text-neutral-600">
            <ImageIcon className="w-16 h-16 stroke-[1]" />
            <span className="text-xs font-mono uppercase tracking-widest">Sin Imagen Asignada</span>
          </div>
        )}

        {/* Badges superiores sobre el media */}
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-10">
          {categoryName && (
            <span className="px-3.5 py-1.5 text-xs font-mono font-extrabold rounded-full bg-accent-cyan text-black uppercase tracking-wider shadow-lg">
              {categoryName}
            </span>
          )}
          {isFamily && (
            <span className="px-3.5 py-1.5 text-xs font-mono font-extrabold rounded-full bg-accent-pink text-white uppercase tracking-wider shadow-lg flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> COLECCIÓN
            </span>
          )}
        </div>
      </div>

      {/* Miniaturas de Galería */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {images.map((img, idx) => {
            const isMediaVideo = img.url.endsWith(".mp4") || img.url.includes("/video/upload/");
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 relative shrink-0 transition-all ${
                  isSelected
                    ? "border-accent-cyan shadow-lg shadow-accent-cyan/20 scale-105"
                    : "border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-600"
                }`}
              >
                {isMediaVideo ? (
                  <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                    <video src={img.url} className="w-full h-full object-cover" muted />
                    <PlayCircle className="w-6 h-6 text-white absolute inset-0 m-auto drop-shadow-md" />
                  </div>
                ) : (
                  <img src={img.url} alt={`${title} thumb ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
