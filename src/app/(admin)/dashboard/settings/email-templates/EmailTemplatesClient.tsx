"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Layout, Eye, Sparkles } from "lucide-react";
import { sendTestEmailAction } from "./actions";

// Importar componentes oficiales de React Email
import WelcomeEmail from "../../../../../../emails/WelcomeEmail";
import OrderConfirmationEmail from "../../../../../../emails/OrderConfirmationEmail";
import AbandonedCartEmail from "../../../../../../emails/AbandonedCartEmail";
import NewsletterEmail from "../../../../../../emails/NewsletterEmail";

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
    defaultSubject: "📦 Confirmación de Pedido GOSU-9999 - GOSU® TCG",
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

// Mock Data de Prueba Constante para la Vista Previa en Vivo y Envíos de Prueba
const MOCK_USER = {
  customerName: "Martín (Jugador GOSU®)",
  userName: "Martín",
  userEmail: "martin@gosu.com",
  toEmail: "martin@gosu.com",
  loyaltyPoints: 50,
};

const MOCK_ORDER = {
  orderId: "GOSU-9999",
  orderNumber: "GOSU-9999",
  customerName: "Martín (Jugador GOSU®)",
  total: 120.0,
  totalAmount: 120.0,
  currency: "S/.",
  loyaltyPointsEarned: 120,
  shippingAddress: "Av. Javier Prado Este 456, Depto 302, San Isidro, Lima",
  orderItems: [
    {
      title: "GOSU® Deckbox PU Leather (Matte Black)",
      name: "GOSU® Deckbox PU Leather (Matte Black)",
      quantity: 1,
      unitPrice: 60.0,
      price: 60.0,
      image: "https://gosuecommerce.vercel.app/gosu-logo-white.png",
    },
    {
      title: "GOSU® Armor Sleeves - Japanese Size (60ct)",
      name: "GOSU® Armor Sleeves - Japanese Size (60ct)",
      quantity: 2,
      unitPrice: 30.0,
      price: 30.0,
      image: "https://gosuecommerce.vercel.app/gosu-logo-white.png",
    },
  ],
};

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
    <div className="space-y-6 font-body">
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

      {/* Grid Principal: Formulario de Configuración + Vista Previa en Vivo con React Email */}
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

        {/* Panel de Vista Previa HTML en Vivo con React Email (Columna Derecha 7/12) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-500" />
              Vista Previa en Vivo (Live Render React Email)
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Mock Data Inyectada
            </span>
          </div>

          {/* Marco de Previsualización React Email */}
          <div className="bg-[#050505] p-2 sm:p-4 rounded-2xl border border-slate-800 shadow-2xl overflow-y-auto max-h-[750px]">
            {activeTab === "WELCOME" && (
              <WelcomeEmail
                customerName={MOCK_USER.customerName}
                userName={MOCK_USER.userName}
                userEmail={MOCK_USER.userEmail}
                loyaltyPoints={MOCK_USER.loyaltyPoints}
              />
            )}

            {activeTab === "ORDER_CONFIRMATION" && (
              <OrderConfirmationEmail
                customerName={MOCK_ORDER.customerName}
                orderId={MOCK_ORDER.orderId}
                orderNumber={MOCK_ORDER.orderNumber}
                total={MOCK_ORDER.total}
                currency={MOCK_ORDER.currency}
                orderItems={MOCK_ORDER.orderItems}
                shippingAddress={MOCK_ORDER.shippingAddress}
                loyaltyPointsEarned={MOCK_ORDER.loyaltyPointsEarned}
              />
            )}

            {activeTab === "ABANDONED_CART" && (
              <AbandonedCartEmail
                toEmail={MOCK_USER.userEmail}
                items={MOCK_ORDER.orderItems.map((i) => ({
                  title: i.title,
                  quantity: i.quantity,
                  price: i.unitPrice,
                }))}
                subtotal={MOCK_ORDER.total}
              />
            )}

            {activeTab === "NEWSLETTER" && (
              <NewsletterEmail
                subject={currentConfig.subject}
                previewText="Descuentos y preventas exclusivas para miembros GOSU®"
                badgeTitle={currentConfig.bannerTitle || "⚡ CLUB GOSU® NEWSLETTER"}
                contentHTML={`<h2 style="color:#FFFFFF; font-size:20px; font-weight:bold; margin:0 0 12px 0;">${currentConfig.bannerTitle}</h2>\n<p style="color:#A3A3A3; font-size:14px; line-height:1.6; margin:0 0 16px 0;">${currentConfig.customNote}</p>\n<div style="background-color:#141414; border:1px solid #262626; padding:16px; border-radius:10px; margin-bottom:20px;">\n  <strong style="color:${currentConfig.accentColor}; font-family:monospace;">🔥 BENEFICIO EXCLUSIVO:</strong>\n  <p style="color:#D4D4D4; font-size:13px; margin:4px 0 0 0;">Canjea tus Puntos Loyalty acumulados por descuentos en accesorios TCG.</p>\n</div>`}
                ctaText="Explorar Catálogo TCG"
                ctaUrl="https://gosuecommerce.vercel.app/products"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
