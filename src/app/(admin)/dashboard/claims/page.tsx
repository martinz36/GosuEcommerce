import React from "react";
import Link from "next/link";
import { BookOpen, FileText, CheckCircle2, Clock, AlertTriangle, Send, User, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { respondClaimAction } from "./actions";

export const revalidate = 0;

export default async function AdminClaimsPage() {
  let claims: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      claims = await prisma.claimSheet.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Error al obtener hojas de reclamación de Neon DB:", err);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESPONDED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Atendido / Respondido</span>;
      case "IN_REVIEW":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">En Revisión</span>;
      case "PENDING":
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pendiente (15 días máx.)</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-body">
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 uppercase tracking-widest mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Cumplimiento Legal Indecopi (Ley N° 29571)</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestión del Libro de Reclamaciones Virtual</h1>
        <p className="text-sm text-slate-500">
          Revisa y responde las Hojas de Reclamación presentadas por los clientes dentro del plazo legal improrrogable de 15 días hábiles.
        </p>
      </div>

      <div className="space-y-6">
        {claims.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-3 text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No hay reclamos ni quejas registradas</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cuando los consumidores completen el formulario del Libro de Reclamaciones en el pie de página, aparecerán listados aquí.
            </p>
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 overflow-hidden">
              {/* Header del Reclamo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {claim.claimNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono ${
                      claim.claimType === "RECLAMO" ? "bg-cyan-100 text-cyan-800" : "bg-pink-100 text-pink-800"
                    }`}>
                      {claim.claimType}
                    </span>
                    {getStatusBadge(claim.status)}
                  </div>
                  <span className="text-xs text-slate-500 font-mono block mt-0.5">
                    Fecha: {new Date(claim.createdAt).toLocaleString()} | Cliente: <strong>{claim.fullName}</strong> ({claim.documentType}: {claim.documentNumber})
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400 block">MONTO RECLAMADO:</span>
                  <span className="text-lg font-bold text-slate-900">
                    {claim.currency === "PEN" ? "S/." : "$"}{Number(claim.claimedAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Detalle del Reclamo */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-bold text-slate-900 block">Contacto del Consumidor:</span>
                    <span className="block text-slate-600">Email: {claim.email} | Teléfono: {claim.phone}</span>
                    <span className="block text-slate-600">Dirección: {claim.address}</span>
                    {claim.isMinor && (
                      <span className="block text-purple-700 font-semibold pt-1">
                        Menor de edad. Apoderado: {claim.parentName} ({claim.parentDocument || "Sin doc"})
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block">Bien Contratado ({claim.contractType}):</span>
                    <p className="text-slate-600">{claim.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 block">Detalle de la Incidencia:</span>
                      <p className="text-slate-700 whitespace-pre-wrap">{claim.claimDetail}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 block">Pedido del Consumidor:</span>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap">{claim.consumerRequest}</p>
                    </div>
                  </div>
                </div>

                {/* Formulario de Respuesta del Proveedor */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-purple-600" />
                    <span>Respuesta Formal del Proveedor</span>
                  </h4>

                  {claim.providerAction && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                      <span className="text-[11px] font-bold text-emerald-900 block">RESPUESTA REGISTRADA:</span>
                      <p className="text-slate-700 text-[11px] whitespace-pre-wrap">{claim.providerAction}</p>
                      {claim.responseDate && (
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Enviado el {new Date(claim.responseDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}

                  <form action={respondClaimAction.bind(null, claim.id)} className="space-y-2">
                    <textarea
                      name="providerAction"
                      required
                      rows={4}
                      placeholder="Escriba aquí las acciones adoptadas y la respuesta formal para el consumidor..."
                      defaultValue={claim.providerAction || ""}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-600"
                    />

                    <select
                      name="status"
                      defaultValue={claim.status}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                    >
                      <option value="RESPONDED">Atendido / Respondido</option>
                      <option value="IN_REVIEW">En Revisión</option>
                      <option value="PENDING">Pendiente</option>
                    </select>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Guardar Respuesta Formal</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
