import React from "react";
import { Mail, Sparkles } from "lucide-react";
import { EmailTemplatesClient } from "./EmailTemplatesClient";

export const revalidate = 0;

export default function EmailTemplatesPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>RESPONSIBLE EMAIL ENGINE</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Plantillas de Correo (Resend)</h1>
          <p className="text-sm text-slate-500">
            Administra, edita los mensajes y prueba el envío en vivo de todas las notificaciones transaccionales y de marketing.
          </p>
        </div>
      </div>

      {/* Componente Cliente Interactivo */}
      <EmailTemplatesClient />
    </div>
  );
}
