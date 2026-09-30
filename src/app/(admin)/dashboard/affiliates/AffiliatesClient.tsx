"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Trash2,
  CreditCard,
  Send,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  X,
  Users,
  DollarSign,
} from "lucide-react";
import {
  createAffiliateAction,
  toggleAffiliateStatusAction,
  payAffiliateCommissionAction,
  deleteAffiliateAction,
  sendAffiliateReportAction,
} from "./actions";

interface AffiliateCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  category: "PROMO" | "REFERRAL" | "AFFILIATE";
  value: number;
  usageCount: number;
  isActive: boolean;
  commissionRate?: number | null;
  createdById?: string | null;
  createdBy?: {
    id: string;
    email: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    pendingCommission?: number | null;
    totalSalesGenerated?: number | null;
  } | null;
  orders?: any[];
}

export default function AffiliatesClient({ affiliateCodes }: { affiliateCodes: AffiliateCode[] }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sendingReportId, setSendingReportId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [code, setCode] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [commissionRate, setCommissionRate] = useState("10.0");
  const [buyerDiscount, setBuyerDiscount] = useState("10.0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !userEmail) return;

    setIsSubmitting(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append("code", code);
    formData.append("userEmail", userEmail);
    formData.append("commissionRate", commissionRate);
    formData.append("buyerDiscount", buyerDiscount);

    const res = await createAffiliateAction(formData);

    if (res.success) {
      setFeedback({ type: "success", msg: `Afiliado ${code.toUpperCase()} registrado exitosamente con la regla 10/10.` });
      setShowCreateModal(false);
      setCode("");
      setUserEmail("");
      setCommissionRate("10.0");
      setBuyerDiscount("10.0");
    } else {
      setFeedback({ type: "error", msg: res.error || "Error al registrar afiliado." });
    }

    setIsSubmitting(false);
  };

  const handleSendReport = async (discountCodeId: string) => {
    setSendingReportId(discountCodeId);
    setFeedback(null);
    setOpenMenuId(null);

    const res = await sendAffiliateReportAction(discountCodeId);

    if (res.success) {
      setFeedback({ type: "success", msg: res.message || "Reporte de estado de cuenta enviado por correo al afiliado." });
    } else {
      setFeedback({ type: "error", msg: res.error || "No se pudo enviar el reporte por correo." });
    }

    setSendingReportId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Cabecera del Módulo y Botón para Registrar Nuevo Afiliado */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            <span>Red de Creadores & Afiliados TCG ({affiliateCodes.length})</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona tu red de creadores TCG, comisiones acumuladas y accesos directos al portal del influencer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs px-5 py-3 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ REGISTRAR NUEVO AFILIADO</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-mono font-medium flex items-center gap-3 shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Modal / Formulario Desplegable para Registrar Afiliados */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
                  Registrar Creador / Afiliado TCG
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Banner de Regla de Negocio Preconfigurada */}
            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-purple-900 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                Regla de Negocio Preconfigurada (10 / 10):
              </p>
              <p className="text-purple-700 text-[11px]">
                Otorga <strong className="font-bold">10% OFF de descuento</strong> en el checkout para los compradores y asigna <strong className="font-bold">10% de comisión ganada</strong> para el creador.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Código del Creador (Cupón) *
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ALEX_TCG"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase font-bold text-purple-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Electrónico del Creador / Influencer *
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="creador@email.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Descuento Comprador (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={buyerDiscount}
                    onChange={(e) => setBuyerDiscount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Comisión Creador (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-purple-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-bold font-mono"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>GUARDAR CREADOR AFILIADO</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Creadores y Afiliados TCG */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {affiliateCodes.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-3">
            <Award className="w-10 h-10 text-purple-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 font-mono">
              No hay códigos de afiliados registrados en la red.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs rounded-xl shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Primer Afiliado</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200 font-mono">
                <tr>
                  <th className="px-4 py-3.5">Código</th>
                  <th className="px-4 py-3.5">Creador / Email</th>
                  <th className="px-4 py-3.5">Descuento Comprador</th>
                  <th className="px-4 py-3.5">% Comisión</th>
                  <th className="px-4 py-3.5 text-center">Usos</th>
                  <th className="px-4 py-3.5 text-right">Ventas Generadas ($)</th>
                  <th className="px-4 py-3.5 text-right">Comisión Acumulada ($)</th>
                  <th className="px-4 py-3.5 text-center">Estado (Switch)</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {affiliateCodes.map((c) => {
                  const uses = c.usageCount || (c.orders ? c.orders.length : 0);
                  const totalSalesGenerated = c.orders
                    ? c.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0)
                    : 0;
                  const commRate = Number(c.commissionRate || 10);
                  const calculatedCommission = totalSalesGenerated * (commRate / 100);
                  const pendingCommission =
                    c.createdBy?.pendingCommission !== undefined && c.createdBy?.pendingCommission !== null
                      ? Number(c.createdBy.pendingCommission)
                      : calculatedCommission;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      {/* Código */}
                      <td className="px-4 py-4 font-mono font-bold text-xs text-purple-700">
                        {c.code}
                      </td>

                      {/* Creador */}
                      <td className="px-4 py-4 max-w-[180px] truncate">
                        {c.createdBy ? (
                          <div>
                            <span className="font-bold text-slate-900 block truncate">
                              {c.createdBy.name || `${c.createdBy.firstName || ""} ${c.createdBy.lastName || ""}`.trim() || c.createdBy.email}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block truncate">
                              {c.createdBy.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No asignado</span>
                        )}
                      </td>

                      {/* Descuento Comprador */}
                      <td className="px-4 py-4 font-mono font-bold text-slate-900">
                        {c.type === "PERCENTAGE" ? `${Number(c.value)}% OFF` : `$${Number(c.value)} OFF`}
                      </td>

                      {/* % Comisión */}
                      <td className="px-4 py-4 font-mono font-bold text-purple-700">
                        {commRate}%
                      </td>

                      {/* Usos */}
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-800">
                        {uses}
                      </td>

                      {/* Ventas Generadas ($) */}
                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-900">
                        ${totalSalesGenerated.toFixed(2)} USD
                      </td>

                      {/* Comisión Acumulada ($) + Botón Pagar */}
                      <td className="px-4 py-4 text-right font-mono">
                        <span className="font-extrabold text-emerald-600 block">
                          ${pendingCommission.toFixed(2)} USD
                        </span>
                        {pendingCommission > 0 && c.createdBy && (
                          <form action={payAffiliateCommissionAction.bind(null, c.createdBy.id)}>
                            <button
                              type="submit"
                              className="mt-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                              title="Marcar comisión acumulada como pagada"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Marcar Pagado</span>
                            </button>
                          </form>
                        )}
                      </td>

                      {/* Switch Toggle Activo / Inactivo */}
                      <td className="px-4 py-4 text-center">
                        <form action={toggleAffiliateStatusAction.bind(null, c.id)}>
                          <button
                            type="submit"
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              c.isActive ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            title={c.isActive ? "Desactivar código" : "Activar código"}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                c.isActive ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </form>
                      </td>

                      {/* Acciones (Paso 4: Menú de 3 Puntos con Ver Portal y Enviar Reporte Resend) */}
                      <td className="px-4 py-4 text-right relative">
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            {sendingReportId === c.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            ) : (
                              <MoreVertical className="w-4 h-4" />
                            )}
                          </button>

                          {openMenuId === c.id && (
                            <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 z-20 p-1 font-sans text-left space-y-0.5">
                              {/* 1. Ver Portal del Afiliado */}
                              <Link
                                href={`/dashboard/affiliates/${c.id}`}
                                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>Ver Portal del Afiliado</span>
                              </Link>

                              {/* 2. Enviar Reporte por Correo con Resend */}
                              <button
                                type="button"
                                onClick={() => handleSendReport(c.id)}
                                className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <Send className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                <span>Enviar Reporte por Correo</span>
                              </button>

                              <div className="border-t border-slate-100 my-1" />

                              {/* 3. Eliminar Registro */}
                              <form action={deleteAffiliateAction.bind(null, c.id)}>
                                <button
                                  type="submit"
                                  className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Eliminar Registro</span>
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
