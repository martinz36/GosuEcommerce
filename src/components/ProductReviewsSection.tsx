"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Star,
  CheckCircle2,
  Award,
  MessageSquare,
  Send,
  Loader2,
  Image as ImageIcon,
  User,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { submitProductReviewAction } from "@/app/(shop)/products/actions";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  imageUrl?: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string | Date;
  user: {
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    image?: string | null;
  };
}

interface ProductReviewsSectionProps {
  productId: string;
  reviews: ReviewItem[];
  currentUser?: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
}

export function ProductReviewsSection({
  productId,
  reviews,
  currentUser,
}: ProductReviewsSectionProps) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calcular Promedio de Estrellas
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("rating", String(rating));
    formData.append("comment", comment);
    if (imageUrl) formData.append("imageUrl", imageUrl);

    startTransition(async () => {
      const res = await submitProductReviewAction(formData);
      if (res.success) {
        setSuccessMessage(res.message || "¡Reseña enviada con éxito!");
        setComment("");
        setImageUrl("");
        setRating(5);
      } else {
        setErrorMessage(res.error || "Ocurrió un error al enviar la reseña.");
      }
    });
  };

  return (
    <section className="pt-12 border-t border-surface-muted space-y-10 font-body text-white">
      {/* Header del Resumen de Valoraciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface p-8 rounded-2xl border border-neutral-800 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="text-center p-4 bg-black rounded-xl border border-neutral-800 shrink-0 min-w-[110px]">
            <span className="text-4xl font-black font-mono text-white block leading-tight">
              {averageRating}
            </span>
            <div className="flex justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3.5 h-3.5 ${
                    star <= Math.round(Number(averageRating))
                      ? "text-amber-400 fill-amber-400"
                      : "text-neutral-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-neutral-400 font-mono">
              {totalReviews} {totalReviews === 1 ? "Opinión" : "Opiniones"}
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight text-white flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-accent-cyan" />
              <span>Reseñas de Jugadores TCG</span>
            </h2>
            <p className="text-xs text-neutral-400 max-w-md">
              Opiniones reales de nuestra comunidad sobre este producto. ¡Deja tu reseña y gana Puntos GOSU® Loyalty!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-accent-pink bg-accent-pink/10 border border-accent-pink/30 px-4 py-2.5 rounded-xl">
          <Award className="w-4 h-4 shrink-0 text-accent-pink" />
          <span>Misión Activa: Gana Puntos al Calificar</span>
        </div>
      </div>

      {/* Formulario de Reseña si el Usuario está Autenticado */}
      {currentUser ? (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-surface rounded-2xl border border-neutral-800 space-y-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm uppercase text-white tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Escribir una Opinión</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Publicando como: <strong className="text-white">{currentUser.name || currentUser.email}</strong>
            </span>
          </div>

          {/* Selector de Estrellas Interactivo */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-neutral-300 block">Tu Calificación:</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                {rating} de 5 estrellas
              </span>
            </div>
          </div>

          {/* Comentario */}
          <div>
            <textarea
              required
              rows={3}
              placeholder="Cuéntanos tu experiencia con este producto..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3.5 bg-black border border-neutral-800 rounded-xl text-xs font-sans text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          {/* URL de Foto Opcional */}
          <div>
            <input
              type="url"
              placeholder="URL de Foto Opcional de tu producto (Ej: Cloudinary u Imgur)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan"
            />
          </div>

          {/* Notificaciones */}
          {successMessage && (
            <p className="text-xs font-mono font-bold text-accent-green bg-accent-green/10 border border-accent-green/30 p-3 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMessage}
            </p>
          )}

          {errorMessage && (
            <p className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isPending || !comment.trim()}
              className="btn-pill bg-white text-black font-extrabold text-xs py-3 px-6 hover:bg-accent-cyan transition-colors flex items-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>PUBLICANDO...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>PUBLICAR RESEÑA & GANAR PUNTOS</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 bg-surface rounded-2xl border border-neutral-800 text-center space-y-3">
          <p className="text-xs font-mono text-neutral-300">
            ¿Compraste este producto o deseas compartir tu opinión?
          </p>
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 btn-pill bg-white text-black font-bold text-xs px-6 py-2.5 hover:bg-accent-cyan transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Inicia Sesión para Dejar una Reseña y Ganar Puntos GOSU®</span>
          </Link>
        </div>
      )}

      {/* Listado de Opiniones de Clientes */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="p-12 text-center bg-black/40 rounded-2xl border border-neutral-800 space-y-3">
            <MessageSquare className="w-10 h-10 text-neutral-700 mx-auto" />
            <p className="text-xs text-neutral-400 font-mono">
              Aún no hay opiniones escritas para este producto. ¡Sé el primero en dejar la tuya!
            </p>
          </div>
        ) : (
          reviews.map((rev) => {
            const authorName = rev.user.firstName
              ? `${rev.user.firstName} ${rev.user.lastName || ""}`.trim()
              : rev.user.name || rev.user.email.split("@")[0];

            return (
              <div
                key={rev.id}
                className="p-6 bg-surface rounded-2xl border border-neutral-800 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.user.image ? (
                      <img
                        src={rev.user.image}
                        alt={authorName}
                        className="w-9 h-9 rounded-full object-cover border border-neutral-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700 text-accent-cyan flex items-center justify-center font-extrabold text-xs uppercase">
                        {authorName.substring(0, 2)}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{authorName}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-mono font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Compra Verificada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-neutral-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-neutral-500">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                  {rev.comment}
                </p>

                {rev.imageUrl && (
                  <div className="pt-2">
                    <img
                      src={rev.imageUrl}
                      alt="Foto de la reseña"
                      className="w-24 h-24 rounded-xl object-cover border border-neutral-800 hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
