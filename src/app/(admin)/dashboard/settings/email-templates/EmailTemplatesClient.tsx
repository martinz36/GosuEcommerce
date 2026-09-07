"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, Layout, Palette, FileText, Eye } from "lucide-react";
import { sendTestEmailAction } from "./actions";

type TemplateType = "WELCOME" | "ORDER_CONFIRMATION" | "ABANDONED_CART" | "NEWSLETTER";

interface TemplateConfig {
  id: TemplateType;
  title: string;
  badge: string;
  defaultSubject: string;
  defaultBanner: string;
  defaultNote: string;
  accentColor: string;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: "WELCOME",
    title: "Bienvenida a la Cuenta",
    badge: "Transaccional",
    defaultSubject: "✨ ¡Bienvenido a GOSU® TCG! Tus 50 Puntos están listos",
    defaultBanner: "¡Bienvenido a la comunidad GOSU!",
    defaultNote: "Tu cuenta ha sido activada exitosamente y hemos sumado tus primeros 50 Puntos de Fidelidad (GOSU® Loyalty) para que los uses en tus compras de accesorios premium TCG.",
    accentColor: "#00F0FF",
  },
  {
    id: "ORDER_CONFIRMATION",
    title: "Confirmación de Pedido",
    badge: "Transaccional",
    defaultSubject: "📦 Confirmación de Pedido GOSU-10001 - GOSU® TCG",
    defaultBanner: "¡Gracias por tu compra!",
    defaultNote: "Hemos recibido tu pago correctamente y estamos preparando tus productos para el despacho.",
    accentColor: "#FF007A",
  },
  {
    id: "ABANDONED_CART",
    title: "Recuperación de Carrito",
    badge: "CRM & Marketing",
    defaultSubject: "🛒 Tus productos TCG te están esperando en GOSU®",
    defaultBanner: "¿Olvidaste completar tu pedido?",
    defaultNote: "Notamos que dejaste algunos accesorios TCG en tu carrito de compra. ¡No dejes pasar el stock de tus fundas y protectores preferidos!",
    accentColor: "#7C3AED",
  },
  {
    id: "NEWSLETTER",
    title: "Suscripción a Newsletter",
    badge: "Marketing",
    defaultSubject: "⚡ ¡Te has suscrito a las ofertas y novedades de GOSU® TCG!",
    defaultBanner: "¡Ya eres parte del Club GOSU®!",
    defaultNote: "Te avisaremos primero que a nadie cuando tengamos nuevos lanzamientos de fundas, binders, preventas exclusivas y códigos de descuento secretos.",
    accentColor: "#10B981",
  },
];

export function EmailTemplatesClient() {
  const [activeTab, setActiveTab] = useState<TemplateType>("WELCOME");
  const [testEmail, setTestEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Estados editables por plantilla
  const [configs, setConfigs] = useState<Record<TemplateType, { subject: string; bannerTitle: string; customNote: string; accentColor: string }>>({
    WELCOME: {
      subject: TEMPLATES[0].defaultSubject,
      bannerTitle: TEMPLATES[0].defaultBanner,
      customNote: TEMPLATES[0].defaultNote,
      accentColor: TEMPLATES[0].accentColor,
    },
    ORDER_CONFIRMATION: {
      subject: TEMPLATES[1].defaultSubject,
      bannerTitle: TEMPLATES[1].defaultBanner,
      customNote: TEMPLATES[1].defaultNote,
      accentColor: TEMPLATES[1].accentColor,
    },
    ABANDONED_CART: {
      subject: TEMPLATES[2].defaultSubject,
      bannerTitle: TEMPLATES[2].defaultBanner,
      customNote: TEMPLATES[2].defaultNote,
      accentColor: TEMPLATES[2].accentColor,
    },
    NEWSLETTER: {
      subject: TEMPLATES[3].defaultSubject,
      bannerTitle: TEMPLATES[3].defaultBanner,
      customNote: TEMPLATES[3].defaultNote,
      accentColor: TEMPLATES[3].accentColor,
    },
  });

  const currentTemplate = TEMPLATES.find((t) => t.id === activeTab)!;
  const currentConfig = configs[activeTab];

  const handleConfigChange = (field: string, value: string) => {
    setConfigs((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !testEmail.trim() || isSending) return;

    setIsSending(true);
    setFeedback(null);

    const res = await sendTestEmailAction({
      templateType: activeTab,
      testEmail: testEmail.trim(),
      subject: currentConfig.subject,
      bannerTitle: currentConfig.bannerTitle,
      customNote: currentConfig.customNote,
      accentColor: currentConfig.accentColor,
    });

    if (res.success) {
      setFeedback({ type: "success", msg: res.message || "Email de prueba enviado exitosamente." });
    } else {
      setFeedback({ type: "error", msg: res.error || "Error al enviar email de prueba." });
    }

    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas de Plantillas */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {TEMPLATES.map((tmpl) => {
          const isActive = tmpl.id === activeTab;
          return (
            <button
              key={tmpl.id}
              onClick={() => {
                setActiveTab(tmpl.id);
                setFeedback(null);
              }}
              className={`px-4 py-2.5 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-2 border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>{tmpl.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-slate-800 text-cyan-400' : 'bg-slate-100 text-slate-500'}`}>
                {tmpl.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Principal: Formulario de Configuración + Vista Previa en Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Panel de Configuración de la Plantilla (Columna Izquierda 5/12) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">{currentTemplate.title}</h2>
              <p className="text-xs text-slate-500 font-mono">Personaliza el mensaje y estilo de esta plantilla</p>
            </div>
            <span
              className="w-4 h-4 rounded-full border border-slate-300 shadow-inner inline-block"
              style={{ backgroundColor: currentConfig.accentColor }}
            />
          </div>

          <div className="space-y-4">
            {/* Campo: Asunto */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Asunto del Correo (Subject)
              </label>
              <input
                type="text"
                value={currentConfig.subject}
                onChange={(e) => handleConfigChange("subject", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Campo: Encabezado */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Título del Encabezado (Header Banner)
              </label>
              <input
                type="text"
                value={currentConfig.bannerTitle}
                onChange={(e) => handleConfigChange("bannerTitle", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Campo: Nota Personalizada */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Mensaje Principal / Nota de la Tienda
              </label>
              <textarea
                rows={4}
                value={currentConfig.customNote}
                onChange={(e) => handleConfigChange("customNote", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Campo: Color de Acento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 font-mono">
                Color de Acento de la Marca
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentConfig.accentColor}
                  onChange={(e) => handleConfigChange("accentColor", e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={currentConfig.accentColor}
                  onChange={(e) => handleConfigChange("accentColor", e.target.value)}
                  className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 uppercase"
                />
              </div>
            </div>
          </div>

          {/* Formulario de Enviar Email de Prueba */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enviar Correo de Prueba a Mi Bandeja</span>
            </h3>

            {feedback && (
              <div
                className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  feedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-rose-50 text-rose-700 border border-rose-200"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{feedback.msg}</span>
              </div>
            )}

            <form onSubmit={handleSendTest} className="space-y-2">
              <input
                type="email"
                required
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>ENVIANDO PRUEBA CON RESEND...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ENVIAR CORREO DE PRUEBA EN VIVO</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Panel de Vista Previa HTML en Vivo (Columna Derecha 7/12) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              Vista Previa en Vivo (Live Render)
            </span>
            <span className="text-[11px] font-mono text-slate-400">Diseño Responsivo Dark Theme</span>
          </div>

          {/* Renderizador de Plantilla HTML */}
          <div className="bg-[#050505] p-6 rounded-xl border border-slate-800 shadow-inner overflow-hidden font-sans text-white">
            <div className="max-w-md mx-auto bg-[#0D0D0D] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Header en Vivo con Logo Oficial Blanco */}
              <div className="p-6 bg-[#141414] border-b border-neutral-800 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/gosu-logo-white.png"
                  alt="GOSU® TCG GEAR"
                  className="h-9 w-auto mx-auto object-contain"
                />
              </div>

              {/* Body en Vivo */}
              <div className="p-6 space-y-4">
                <div
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-mono font-bold"
                  style={{
                    backgroundColor: `${currentConfig.accentColor}20`,
                    borderColor: currentConfig.accentColor,
                    borderWidth: "1px",
                    color: currentConfig.accentColor,
                  }}
                >
                  {currentTemplate.badge}
                </div>

                <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">
                  {currentConfig.bannerTitle}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {currentConfig.customNote}
                </p>

                {/* Caja Informativa Demostrativa */}
                <div className="p-4 bg-[#141414] border border-neutral-800 rounded-xl space-y-1 text-xs">
                  <span className="text-neutral-400 block font-mono text-[11px]">Asunto configurado:</span>
                  <span className="text-white font-mono font-semibold block">{currentConfig.subject}</span>
                </div>

                {/* Botón de Acción Simulada */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    style={{ backgroundColor: currentConfig.accentColor }}
                    className="px-6 py-3 rounded-full text-black font-extrabold font-mono text-xs uppercase shadow-lg transition-transform hover:scale-105"
                  >
                    Ver en GOSU® TCG &rarr;
                  </button>
                </div>
              </div>

              {/* Footer en Vivo */}
              <div className="p-4 bg-[#050505] border-t border-neutral-900 text-center text-[10px] text-neutral-600 font-mono">
                &copy; {new Date().getFullYear()} GOSU® TCG Gear. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
