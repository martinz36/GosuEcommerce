"use client";

import React, { useState } from "react";
import { Building2, CheckCircle2, AlertCircle, Loader2, Save } from "lucide-react";
import { saveAffiliateBankDetailsAction } from "@/app/(admin)/dashboard/affiliates/actions";

interface BankFormProps {
  discountCodeId?: string;
  userId?: string;
  initialBankName?: string | null;
  initialAccountNumber?: string | null;
  initialAccountName?: string | null;
  variant?: "dark" | "light";
}

export function AffiliateBankDetailsForm({
  discountCodeId,
  userId,
  initialBankName,
  initialAccountNumber,
  initialAccountName,
  variant = "dark",
}: BankFormProps) {
  const [bankName, setBankName] = useState<string>(initialBankName || "BCP");
  const [accountNumber, setAccountNumber] = useState<string>(initialAccountNumber || "");
  const [accountName, setAccountName] = useState<string>(initialAccountName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    const formData = new FormData();
    if (discountCodeId) formData.append("discountCodeId", discountCodeId);
    if (userId) formData.append("userId", userId);
    formData.append("bankName", bankName);
    formData.append("accountNumber", accountNumber);
    formData.append("accountName", accountName);

    const res = await saveAffiliateBankDetailsAction(formData);

    if (res.success) {
      setFeedback({ type: "success", msg: "¡Datos bancarios guardados exitosamente!" });
    } else {
      setFeedback({ type: "error", msg: res.error || "Error al guardar datos bancarios." });
    }

    setIsLoading(false);
  };

  const isDark = variant === "dark";

  return (
    <div
      className={`p-6 rounded-2xl border ${
        isDark ? "bg-surface border-neutral-800 text-white" : "bg-white border-slate-200 text-slate-900"
      } shadow-sm space-y-4 font-sans`}
    >
      <div className="flex items-center justify-between border-b pb-3 border-neutral-800">
        <div className="flex items-center gap-2">
          <Building2 className={`w-5 h-5 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
          <h3 className="font-bold text-sm uppercase tracking-wider font-mono">
            Datos Bancarios para Liquidación (Exclusivo BCP / Interbank)
          </h3>
        </div>
      </div>

      <p className={`text-xs ${isDark ? "text-neutral-400" : "text-slate-500"}`}>
        Ingresa tu cuenta bancaria o CCI para recibir el depósito automático de tus comisiones acumuladas.
      </p>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono font-medium flex items-center gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Banco (Restringido a BCP o Interbank) */}
          <div>
            <label className={`block text-xs font-bold font-mono mb-1.5 ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
              Banco Registrado *
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold focus:outline-none ${
                isDark
                  ? "bg-black border border-neutral-800 text-white focus:border-purple-500"
                  : "bg-slate-50 border border-slate-200 text-slate-900 focus:border-purple-600"
              }`}
            >
              <option value="BCP">BCP (Banco de Crédito del Perú)</option>
              <option value="Interbank">Interbank</option>
            </select>
          </div>

          {/* Número de Cuenta / CCI */}
          <div>
            <label className={`block text-xs font-bold font-mono mb-1.5 ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
              Nº Cuenta o CCI *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: 193-98765432-0-88 o CCI"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none ${
                isDark
                  ? "bg-black border border-neutral-800 text-white placeholder:text-neutral-600 focus:border-purple-500"
                  : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600"
              }`}
            />
          </div>

          {/* Titular de la Cuenta */}
          <div>
            <label className={`block text-xs font-bold font-mono mb-1.5 ${isDark ? "text-neutral-300" : "text-slate-700"}`}>
              Titular de la Cuenta
            </label>
            <input
              type="text"
              placeholder="Nombre completo del titular"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono focus:outline-none ${
                isDark
                  ? "bg-black border border-neutral-800 text-white placeholder:text-neutral-600 focus:border-purple-500"
                  : "bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-600"
              }`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 ${
              isDark
                ? "bg-purple-600 hover:bg-purple-500 text-white"
                : "bg-purple-700 hover:bg-purple-800 text-white"
            } disabled:opacity-50`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>GUARDAR DATOS BANCARIOS</span>
          </button>
        </div>
      </form>
    </div>
  );
}
