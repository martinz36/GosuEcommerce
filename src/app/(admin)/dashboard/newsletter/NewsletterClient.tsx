"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Layout,
} from "lucide-react";
import { sendTestNewsletterAction, sendBroadcastNewsletterAction } from "./actions";

interface NewsletterClientProps {
  initialSubscriberCount: number;
}

export function NewsletterClient({ initialSubscriberCount }: NewsletterClientProps) {
  // Campos del boletín
  const [subject, setSubject] = useState("⚡ ¡Novedades Exclusivas en GOSU® TCG!");
  const [previewText, setPreviewText] = useState("Descubre las nuevas fundas, carpetas y preventas TCG.");
  const [badgeTitle, setBadgeTitle] = useState("⚡ NOVEDADES & CLUB GOSU®");
  const [contentHTML, setContentHTML] = useState(
    `<h2 style="color: #FFFFFF; font-size: 20px; font-weight: bold; margin: 0 0 12px 0;">¡Hola Jugador!</h2>\n<p style="color: #A3A3A3; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">Nos complace anunciarte el lanzamiento de nuestros nuevos accesorios premium de protección TCG.</p>\n<div style="background-color: #141414; border: 1px solid #262626; padding: 16px; border-radius: 10px; margin-bottom: 20px;">\n  <strong style="color: #00F0FF; font-family: monospace;">🔥 LOTE LIMITADO DISPONIBLE:</strong>\n  <p style="color: #D4D4D4; font-size: 13px; margin: 6px 0 0 0;">Aprovecha hasta un 15% de descuento adicional en tu próximo pedido usando tus Puntos Loyalty.</p>\n</div>`
  );
  const [ctaText, setCtaText] = useState("Explorar Catálogo &rarr;");
  const [ctaUrl, setCtaUrl] = useState("https://gosuecommerce.vercel.app/products");

  // Estado de vista previa (Split screen vs Tab)
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  // Estados de envío
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Helper para insertar etiquetas HTML en el editor
  const insertTag = (openTag: string, closeTag: string) => {
    setContentHTML((prev) => `${prev}\n${openTag}${closeTag}`);
  };

  const insertImagePrompt = () => {
    const url = prompt("Ingresa la URL pública de la imagen:");
    if (url) {
      insertTag(`<img src="${url}" alt="Novedad" style="max-width: 100%; border-radius: 10px; margin: 16px 0;" />`, "");
    }
  };

  const insertLinkPrompt = () => {
    const url = prompt("Ingresa la URL del enlace:");
    const text = prompt("Texto del enlace:") || "Ver más";
    if (url) {
      insertTag(`<a href="${url}" style="color: #00F0FF; font-weight: bold; text-decoration: underline;">${text}</a>`, "");
    }
  };

  const insertCallout = () => {
    insertTag(
      `<div style="background-color: #141414; border: 1px solid #262626; padding: 16px; border-radius: 10px; margin: 16px 0;">\n  <strong style="color: #FF007A;">💡 AVISO IMPORTANTE:</strong>\n  <p style="color: #D4D4D4; font-size: 13px; margin: 4px 0 0 0;">Escribe tu mensaje destacado aquí...</p>\n</div>`,
      ""
    );
  };

  // Handler para enviar correo de prueba
  const handleSendTest = async () => {
    if (!testEmail) {
      setFeedback({ type: "error", msg: "Por favor ingresa tu correo de prueba." });
      return;
    }

    setIsSendingTest(true);
    setFeedback(null);

    const res = await sendTestNewsletterAction({
      testEmail,
      subject,
      previewText,
      contentHTML,
      ctaText,
      ctaUrl,
    });

    if (res.success) {
      setFeedback({ type: "success", msg: `¡Correo de prueba enviado a ${testEmail}!` });
    } else {
      setFeedback({ type: "error", msg: res.error || "No se pudo enviar el correo de prueba." });
    }

    setIsSendingTest(false);
  };

  // Handler para enviar boletín masivo a todos los suscriptores
  const handleSendBroadcast = async () => {
    const confirm = window.confirm(
      `¿Estás seguro de enviar esta novedad a los ${initialSubscriberCount} suscriptores de GOSU®?`
    );
    if (!confirm) return;

    setIsSendingBroadcast(true);
    setFeedback(null);

    const res = await sendBroadcastNewsletterAction({
      subject,
      previewText,
      contentHTML,
      ctaText,
      ctaUrl,
    });

    if (res.success) {
      setFeedback({ type: "success", msg: res.message || "Boletín despachado exitosamente." });
    } else {
      setFeedback({ type: "error", msg: res.error || "Error al transmitir el boletín masivo." });
    }

    setIsSendingBroadcast(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-body">
      {/* Header General */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-900 text-cyan-400 font-mono text-[10px] font-bold rounded-md uppercase tracking-wider">
              Resend + React Email
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <strong>{initialSubscriberCount}</strong> Suscriptores
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Módulo de Novedades & Newsletter
          </h1>
          <p className="text-xs text-slate-500">
            Redacta comunicados masivos y lanzamientos integrados automáticamente con la plantilla maestra de GOSU®.
          </p>
        </div>

        {/* Selector de Modo de Vista */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setViewMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "edit" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setViewMode("split")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "split" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Dividido</span>
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "preview" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Previa</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.msg}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Grid Principal: Editor / Vista Previa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Editor */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div className={`${viewMode === "split" ? "lg:col-span-6" : "lg:col-span-12"} space-y-6`}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-slate-500" />
                <span>Configuración del Mensaje</span>
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Asunto del Correo (Subject) *
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: ⚡ Preventa Exclusiva: Fundas GOSU® Matte Series"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Texto de Previsualización (Preview Text)
                  </label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    placeholder="Ej: Solo para miembros del Club GOSU®. Stock limitado."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Etiqueta Badge Superior
                    </label>
                    <input
                      type="text"
                      value={badgeTitle}
                      onChange={(e) => setBadgeTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase text-emerald-600 focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Texto Botón CTA (Opcional)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Ej: Ir a la Tienda →"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                {ctaText && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      URL Enlace Botón CTA
                    </label>
                    <input
                      type="url"
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Toolbar del Editor Enriquecido Ligero */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Cuerpo del Mensaje (Editor Rico HTML) *
                </label>

                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-100 border border-slate-200 rounded-t-xl text-slate-700">
                  <button
                    type="button"
                    onClick={() => insertTag("<strong>", "Texto Negrita</strong>")}
                    title="Negrita"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs font-bold transition-colors"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTag("<em>", "Texto Cursiva</em>")}
                    title="Cursiva"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs transition-colors"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTag("<u>", "Texto Subrayado</u>")}
                    title="Subrayado"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs transition-colors"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertTag('<h2 style="color: #FFFFFF; font-size: 20px; font-weight: bold;">', "Encabezado Principal</h2>")}
                    title="Encabezado H2"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs font-bold transition-colors"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertTag('<h3 style="color: #00F0FF; font-size: 16px; font-weight: bold;">', "Subencabezado Cyan</h3>")}
                    title="Subencabezado H3"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs font-bold transition-colors text-cyan-600"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-4 bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => insertTag('<ul style="margin: 8px 0; padding-left: 20px; color: #A3A3A3;">\n  <li>Elemento 1</li>\n  <li>Elemento 2</li>\n</ul>', "")}
                    title="Lista con Viñetas"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs transition-colors"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={insertCallout}
                    title="Insertar Tarjeta Destacada (Callout)"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span className="text-[10px]">Callout</span>
                  </button>

                  <div className="w-px h-4 bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={insertImagePrompt}
                    title="Insertar Imagen"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={insertLinkPrompt}
                    title="Insertar Enlace"
                    className="p-1.5 bg-white hover:bg-slate-200 rounded text-xs transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={contentHTML}
                  onChange={(e) => setContentHTML(e.target.value)}
                  className="w-full p-3.5 bg-slate-900 border border-slate-200 border-t-0 rounded-b-xl text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
                />
              </div>

              {/* Acciones de Envío */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                {/* Enviar Prueba */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    1. Probar plantilla antes de transmitir:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="tu-correo@admin.com"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendTest}
                      disabled={isSendingTest}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isSendingTest ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      <span>Enviar Prueba</span>
                    </button>
                  </div>
                </div>

                {/* Enviar Masivo */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-mono">
                    Alcance: <strong>{initialSubscriberCount}</strong> cuentas de usuario
                  </span>
                  <button
                    type="button"
                    onClick={handleSendBroadcast}
                    disabled={isSendingBroadcast}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSendingBroadcast ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitiendo...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Novedad Masiva</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Columna Previsualización en Vivo (React Email Master Container) */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className={`${viewMode === "split" ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-mono text-slate-400 ml-2">Previsualización Resend React Email</span>
                </div>
                <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                  Master Container GOSU®
                </span>
              </div>

              {/* Marco del Email GOSU® */}
              <div className="bg-[#050505] p-4 sm:p-8 rounded-xl border border-[#262626] max-w-[600px] mx-auto text-white">
                {/* Header Logo */}
                <div className="bg-[#141414] border-b border-[#262626] p-6 text-center rounded-t-xl -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/gosu-logo-white.png"
                    alt="GOSU® TCG GEAR"
                    className="h-9 w-auto mx-auto object-contain"
                  />
                </div>

                {/* Badge Header */}
                <div className="inline-block bg-emerald-950/40 border border-emerald-500/40 rounded-full px-3 py-1 mb-4">
                  <span className="text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    {badgeTitle || "⚡ NOVEDADES & CLUB GOSU®"}
                  </span>
                </div>

                {/* HTML renderizado dinámico */}
                <div
                  className="prose prose-invert text-xs leading-relaxed mb-6 text-slate-300"
                  dangerouslySetInnerHTML={{ __html: contentHTML }}
                />

                {/* Botón CTA Opcional */}
                {ctaText && (
                  <div className="text-center my-6">
                    <a
                      href={ctaUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs font-mono uppercase px-7 py-3.5 rounded-full shadow-md text-decoration-none"
                    >
                      {ctaText}
                    </a>
                  </div>
                )}

                {/* Footer GOSU® */}
                <div className="border-t border-[#1A1A1A] pt-6 mt-8 text-center text-[10px] font-mono text-slate-500">
                  &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.<br />
                  Recibes este correo porque estás suscrito a las novedades de GOSU® TCG Gear.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
