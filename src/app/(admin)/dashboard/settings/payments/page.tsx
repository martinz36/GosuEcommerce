"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, ShieldCheck, Zap, AlertCircle, Save, Loader2 } from "lucide-react";

export default function AdminPaymentSettingsPage() {
  const [activeGateway, setActiveGateway] = useState<string>("stripe");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings/payments");
        if (res.ok) {
          const data = await res.json();
          if (data.activePaymentGateway) {
            setActiveGateway(data.activePaymentGateway.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Error al cargar la configuración de pagos:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePaymentGateway: activeGateway }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la pasarela");
      }

      setMessage({
        type: "success",
        text: `Pasarela de pago activa configurada a ${activeGateway === "mercadopago" ? "Mercado Pago" : "Stripe"} con éxito.`,
      });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "No se pudo actualizar la pasarela de pago.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 font-body">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
        <p className="text-xs font-mono text-slate-500">Cargando configuración de pasarela de pago desde Neon DB...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-body">
      {/* Header Banner Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-cyan" />
            <span>AJUSTES DE MOTOR DE PAGOS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
            Pasarela de Pago Activa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Selecciona la pasarela principal que procesará el Checkout de tus clientes en la tienda.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition-all shadow-md disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-accent-cyan" />
          )}
          <span>{isSaving ? "Guardando..." : "Guardar Pasarela Activa"}</span>
        </button>
      </div>

      {/* Alerta de Mensaje de Resultado */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-3 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Selector de Pasarela (Radio Cards Premium) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opción 1: Stripe */}
        <div
          onClick={() => setActiveGateway("stripe")}
          className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            activeGateway === "stripe"
              ? "bg-white border-slate-900 shadow-xl ring-2 ring-slate-900/10"
              : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Stripe Payments</h3>
                <span className="text-[10px] font-mono text-indigo-600 font-bold uppercase tracking-wider block">
                  GLOBAL & USD / PEN
                </span>
              </div>
            </div>

            <input
              type="radio"
              name="paymentGateway"
              value="stripe"
              checked={activeGateway === "stripe"}
              onChange={() => setActiveGateway("stripe")}
              className="w-5 h-5 text-slate-900 focus:ring-slate-900 border-slate-300"
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Procesamiento seguro internacional de tarjetas de crédito y débito (Visa, Mastercard, American Express). Redirección oficial al Checkout encriptado de Stripe.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Integración:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
              Stripe SDK Checkout
            </span>
          </div>
        </div>

        {/* Opción 2: Mercado Pago */}
        <div
          onClick={() => setActiveGateway("mercadopago")}
          className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
            activeGateway === "mercadopago"
              ? "bg-white border-cyan-600 shadow-xl ring-2 ring-cyan-500/10"
              : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Mercado Pago</h3>
                <span className="text-[10px] font-mono text-cyan-700 font-bold uppercase tracking-wider block">
                  PERÚ & LATAM (YAPE / TARJETAS)
                </span>
              </div>
            </div>

            <input
              type="radio"
              name="paymentGateway"
              value="mercadopago"
              checked={activeGateway === "mercadopago"}
              onChange={() => setActiveGateway("mercadopago")}
              className="w-5 h-5 text-cyan-600 focus:ring-cyan-500 border-slate-300"
            />
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Pasarela oficial líder en Perú y América Latina. Admite pagos con Yape, tarjetas de débito/crédito locales y transferencias en Soles (PEN) con redirección a Mercado Pago Checkout.
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Integración:</span>
            <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 font-bold">
              Mercado Pago Preference
            </span>
          </div>
        </div>
      </div>

      {/* Nota Informativa */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs space-y-1 font-mono">
        <span className="font-bold text-slate-800 block">💡 Nota de Arquitectura:</span>
        <p>
          El frontend del carrito de compras permanece intacto. Al presionar "Procesar Pago", el servidor redirigirá dinámicamente al usuario al checkout de la pasarela seleccionada en este panel.
        </p>
      </div>
    </div>
  );
}
