"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Building2,
  Gift,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { processAffiliatePayoutAction } from "@/app/(admin)/dashboard/affiliates/actions";

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  discountCodeId: string;
  creatorName: string;
  creatorEmail?: string;
  commPEN: number;
  commUSD: number;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
}

export function AffiliatePayoutModal({
  isOpen,
  onClose,
  discountCodeId,
  creatorName,
  creatorEmail,
  commPEN,
  commUSD,
  bankName,
  accountNumber,
  accountName,
}: PayoutModalProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<"PEN" | "USD">(
    commPEN > 0 ? "PEN" : "USD"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
    storeCreditCode?: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentAmount = selectedCurrency === "PEN" ? commPEN : commUSD;
  const currencySymbol = selectedCurrency === "PEN" ? "S/." : "$";

  const handleProcessPayout = async (payoutMethod: "TRANSFER" | "STORE_CREDIT") => {
    if (currentAmount <= 0) {
      setFeedback({
        type: "error",
        msg: `No hay comisiones acumuladas en ${selectedCurrency} para liquidar.`,
      });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const res = await processAffiliatePayoutAction({
      discountCodeId,
      payoutMethod,
      currency: selectedCurrency,
      amount: currentAmount,
    });

    if (res.success) {
      setFeedback({
        type: "success",
        msg: res.message || "Liquidación procesada exitosamente.",
        storeCreditCode: res.storeCreditCode,
      });
    } else {
      setFeedback({
        type: "error",
        msg: res.error || "Ocurrió un error al procesar la liquidación.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
              Liquidar Comisiones - {creatorName}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs font-mono font-medium space-y-1 shadow-sm ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-rose-50 text-rose-900 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{feedback.msg}</span>
            </div>

            {feedback.storeCreditCode && (
              <div className="p-3 bg-white border border-emerald-300 rounded-lg text-center mt-2">
                <span className="text-[10px] text-slate-500 block uppercase">Código de Crédito Generado:</span>
                <span className="text-lg font-black font-mono text-purple-700 select-all block">
                  {feedback.storeCreditCode}
                </span>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  Restringido a compras en la tienda para {creatorEmail || creatorName}.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Selector de Moneda a Liquidar */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase font-mono">
            1. Selecciona la Moneda a Liquidar:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedCurrency("PEN")}
              className={`p-3 rounded-xl border text-left font-mono transition-colors ${
                selectedCurrency === "PEN"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] uppercase text-slate-500 block">Soles (PEN)</span>
              <span className="text-lg font-black block text-emerald-700">S/. {commPEN.toFixed(2)}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCurrency("USD")}
              className={`p-3 rounded-xl border text-left font-mono transition-colors ${
                selectedCurrency === "USD"
                  ? "border-purple-500 bg-purple-50 text-purple-900 font-bold"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-[10px] uppercase text-slate-500 block">Dólares (USD)</span>
              <span className="text-lg font-black block text-purple-700">$ {commUSD.toFixed(2)}</span>
            </button>
          </div>
        </div>

        {/* Datos Bancarios Registrados del Afiliado */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 font-mono flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Datos Bancarios Registrados (BCP / Interbank):</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800 font-bold">
              {bankName || "No registrado"}
            </span>
          </div>

          {accountNumber ? (
            <div className="space-y-0.5 font-mono text-[11px] text-slate-700 pt-1 border-t border-slate-200 mt-2">
              <p>
                <strong className="text-slate-900">Nº Cuenta/CCI:</strong> {accountNumber}
              </p>
              {accountName && (
                <p>
                  <strong className="text-slate-900">Titular:</strong> {accountName}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-amber-700 font-mono italic pt-1">
              El creador aún no ha registrado su cuenta de BCP/Interbank en el portal.
            </p>
          )}
        </div>

        {/* Acciones de Liquidación */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase font-mono">
            2. Elige el Método de Liquidación:
          </label>

          {/* Opción A: Transferencia Bancaria */}
          <button
            type="button"
            disabled={isLoading || currentAmount <= 0}
            onClick={() => handleProcessPayout("TRANSFER")}
            className="w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-between disabled:opacity-50 shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Building2 className="w-5 h-5 shrink-0 text-emerald-200" />
              <div>
                <span className="block font-bold">MARCAR COMO TRANSFERIDO</span>
                <span className="text-[10px] text-emerald-100 font-normal block">
                  Confirma que realizaste la transferencia manual BCP/Interbank
                </span>
              </div>
            </div>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>

          {/* Opción B: Convertir a Crédito en Tienda */}
          <button
            type="button"
            disabled={isLoading || currentAmount <= 0}
            onClick={() => handleProcessPayout("STORE_CREDIT")}
            className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center justify-between disabled:opacity-50 shadow-sm"
          >
            <div className="flex items-center gap-2.5 text-left">
              <Gift className="w-5 h-5 shrink-0 text-purple-200" />
              <div>
                <span className="block font-bold">CONVERTIR A CRÉDITO EN TIENDA</span>
                <span className="text-[10px] text-purple-100 font-normal block">
                  Genera un cupón de monto fijo ({currencySymbol} {currentAmount.toFixed(2)}) para la tienda
                </span>
              </div>
            </div>
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
