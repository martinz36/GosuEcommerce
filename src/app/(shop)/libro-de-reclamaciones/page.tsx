"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Printer,
  ArrowLeft,
  BookOpen,
  Info,
  Building2,
  User,
  ShoppingBag,
  MessageSquare
} from "lucide-react";
import { submitClaimAction, SubmitClaimResult } from "./actions";

export default function LibroDeReclamacionesPage() {
  const [isMinor, setIsMinor] = useState(false);
  const [contractType, setContractType] = useState<"PRODUCTO" | "SERVICIO">("PRODUCTO");
  const [claimType, setClaimType] = useState<"RECLAMO" | "QUEJA">("RECLAMO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedClaim, setSubmittedClaim] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("isMinor", isMinor ? "true" : "false");
    formData.set("contractType", contractType);
    formData.set("claimType", claimType);

    const result: SubmitClaimResult = await submitClaimAction(formData);

    setIsSubmitting(false);

    if (result.success && result.claimData) {
      setSubmittedClaim(result.claimData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrorMessage(result.error || "Ocurrió un error al registrar su reclamación.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-body py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Botón Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-accent-cyan transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la Tienda</span>
        </Link>

        {/* Modal / Constancia de Reclamo Enviado Exitosamente */}
        {submittedClaim ? (
          <div className="bg-surface rounded-2xl border border-emerald-500/40 p-8 md:p-12 space-y-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                    REGISTRO EXITOSO EN INDECOPI
                  </span>
                  <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                    HOJA DE RECLAMACIÓN VIRTUAL
                  </h1>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-xs text-neutral-400 block">CÓDIGO DE SEGUIMIENTO:</span>
                <span className="text-2xl font-extrabold text-accent-cyan">{submittedClaim.claimNumber}</span>
                <span className="text-[11px] text-neutral-500 block">{new Date(submittedClaim.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl space-y-2 text-xs leading-relaxed text-neutral-300">
              <p className="font-semibold text-white">Estimado(a) {submittedClaim.fullName},</p>
              <p>
                Su <strong className="text-accent-cyan">{submittedClaim.claimType}</strong> ha sido registrado correctamente bajo el número <strong className="font-mono text-white">{submittedClaim.claimNumber}</strong>.
              </p>
              <p className="text-neutral-400">
                Se enviará una copia del resumen a su correo electrónico <strong className="text-white">{submittedClaim.email}</strong>. De acuerdo al Código de Protección y Defensa del Consumidor (Ley N° 29571), daremos respuesta formal en un plazo no mayor a 15 días hábiles.
              </p>
            </div>

            {/* Resumen de la Hoja de Reclamación enviada */}
            <div className="bg-black/60 rounded-xl border border-neutral-800 p-6 space-y-6 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">PROVEEDOR:</span>
                  <span className="text-white font-bold block">MV INVESTMENTS S.A.C.</span>
                  <span className="text-neutral-400">RUC: 20601338409</span>
                  <span className="text-neutral-500 block text-[11px]">JR. LOS CONQUISTADORES 154, SURCO, LIMA, PERU</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">CONSUMIDOR RECLAMANTE:</span>
                  <span className="text-white font-bold block">{submittedClaim.fullName}</span>
                  <span className="text-neutral-400">{submittedClaim.documentType}: {submittedClaim.documentNumber}</span>
                  <span className="text-neutral-400 block">Teléfono: {submittedClaim.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">BIEN CONTRATADO:</span>
                  <span className="text-white font-bold block">{submittedClaim.contractType}</span>
                  <span className="text-accent-pink font-bold">Monto: {submittedClaim.currency === "PEN" ? "S/." : "$"}{Number(submittedClaim.claimedAmount).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">DESCRIPCIÓN DEL BIEN:</span>
                  <span className="text-neutral-300">{submittedClaim.description}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-neutral-500 block">DETALLE DE LA RECLAMACIÓN ({submittedClaim.claimType}):</span>
                  <p className="text-neutral-200 mt-1 whitespace-pre-wrap">{submittedClaim.claimDetail}</p>
                </div>
                <div>
                  <span className="text-neutral-500 block">PEDIDO / SOLUCIÓN SOLICITADA POR EL CONSUMIDOR:</span>
                  <p className="text-neutral-200 mt-1 whitespace-pre-wrap">{submittedClaim.consumerRequest}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto btn-pill bg-white text-black font-extrabold text-xs px-6 py-3 hover:bg-accent-cyan transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Hoja de Reclamación</span>
              </button>

              <button
                onClick={() => setSubmittedClaim(null)}
                className="text-xs text-neutral-400 hover:text-white underline"
              >
                Ingresar otra reclamación
              </button>
            </div>
          </div>
        ) : (
          /* Formulario Oficial del Libro de Reclamaciones Virtual */
          <div className="bg-surface rounded-2xl border border-neutral-800 p-6 sm:p-10 space-y-8 shadow-2xl">
            
            {/* Header / Encabezado Legal */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-neutral-800 pb-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold">
                  <BookOpen className="w-4 h-4" />
                  <span>CONFORME A LEY N° 29571 - INDECOPI PERÚ</span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                  LIBRO DE RECLAMACIONES VIRTUAL
                </h1>
                <p className="text-xs text-neutral-400 max-w-xl">
                  Formulario oficial para presentar reclamos o quejas sobre los productos o servicios contratados en GOSU® TCG GEAR.
                </p>
              </div>

              {/* Ficha Proveedor */}
              <div className="bg-black/60 p-4 rounded-xl border border-neutral-800 text-xs font-mono space-y-1 shrink-0">
                <span className="text-[11px] font-bold text-accent-cyan uppercase tracking-wider block">
                  PROVEEDOR DEL SERVICIO:
                </span>
                <span className="font-bold text-white block">MV INVESTMENTS S.A.C.</span>
                <span className="text-neutral-400 block">RUC: 20601338409</span>
                <span className="text-neutral-500 text-[10px] block leading-tight max-w-[220px]">
                  JR. LOS CONQUISTADORES 154, SURCO, LIMA, PERU
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 font-mono">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* SECCIÓN 1: IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <User className="w-4 h-4 text-accent-cyan" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-cyan">
                    1. IDENTIFICACIÓN DEL CONSUMIDOR RECLAMANTE
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Nombre Completo (Nombres y Apellidos) *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="Ej: Juan Pérez García"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Tipo de Documento *
                    </label>
                    <select
                      name="documentType"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="DNI">DNI (Documento Nacional de Identidad)</option>
                      <option value="CE">Carnet de Extranjería (CE)</option>
                      <option value="PASAPORTE">Pasaporte</option>
                      <option value="RUC">RUC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Número de Documento *
                    </label>
                    <input
                      type="text"
                      name="documentNumber"
                      required
                      placeholder="Ej: 71234567"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Domicilio / Dirección Completa *
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Ej: Av. Benavides 1234, Dpto 301, Miraflores, Lima"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Teléfono de Contacto *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="Ej: 987654321"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="tu@email.com"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>

                {/* Checkbox Menor de Edad */}
                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                    <input
                      type="checkbox"
                      checked={isMinor}
                      onChange={(e) => setIsMinor(e.target.checked)}
                      className="rounded bg-black border-neutral-700 text-accent-cyan focus:ring-0"
                    />
                    <span>El consumidor reclamante es menor de edad</span>
                  </label>
                </div>

                {isMinor && (
                  <div className="p-4 bg-black/80 rounded-xl border border-neutral-800 space-y-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 text-xs font-bold text-accent-pink">
                      Datos del Padre, Madre o Apoderado:
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">Nombre Completo del Apoderado *</label>
                      <input
                        type="text"
                        name="parentName"
                        required={isMinor}
                        placeholder="Nombre completo del representante"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-neutral-400 mb-1">DNI / CE del Apoderado</label>
                      <input
                        type="text"
                        name="parentDocument"
                        placeholder="Número de documento"
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 2: IDENTIFICACIÓN DEL BIEN CONTRATADO */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <ShoppingBag className="w-4 h-4 text-accent-pink" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-pink">
                    2. IDENTIFICACIÓN DEL BIEN CONTRATADO
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Tipo de Bien *
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="contractTypeRadio"
                          checked={contractType === "PRODUCTO"}
                          onChange={() => setContractType("PRODUCTO")}
                          className="text-accent-pink"
                        />
                        <span>Producto</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="radio"
                          name="contractTypeRadio"
                          checked={contractType === "SERVICIO"}
                          onChange={() => setContractType("SERVICIO")}
                          className="text-accent-pink"
                        />
                        <span>Servicio</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Monto Reclamado *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="claimedAmount"
                      required
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-accent-pink"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Moneda
                    </label>
                    <select
                      name="currency"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="PEN">Soles (PEN S/.)</option>
                      <option value="USD">Dólares (USD $)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Descripción del Producto o Servicio Contratado *
                    </label>
                    <input
                      type="text"
                      name="description"
                      required
                      placeholder="Ej: GOSU® Armor Sleeves Matte Black - Pedido #GOSU-1092"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-pink"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                  <MessageSquare className="w-4 h-4 text-accent-yellow" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-accent-yellow">
                    3. DETALLE DE LA RECLAMACIÓN Y PEDIDO DEL CONSUMIDOR
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">
                      Tipo de Incidencia *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setClaimType("RECLAMO")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          claimType === "RECLAMO"
                            ? "bg-neutral-900 border-accent-cyan text-white"
                            : "bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <input
                            type="radio"
                            name="claimTypeRadio"
                            checked={claimType === "RECLAMO"}
                            onChange={() => setClaimType("RECLAMO")}
                            className="text-accent-cyan"
                          />
                          <span>RECLAMO <sup>1</sup></span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                          Disconformidad relacionada directamente a los productos o servicios adquiridos.
                        </p>
                      </div>

                      <div
                        onClick={() => setClaimType("QUEJA")}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                          claimType === "QUEJA"
                            ? "bg-neutral-900 border-accent-pink text-white"
                            : "bg-black border-neutral-800 text-neutral-400 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <input
                            type="radio"
                            name="claimTypeRadio"
                            checked={claimType === "QUEJA"}
                            onChange={() => setClaimType("QUEJA")}
                            className="text-accent-pink"
                          />
                          <span>QUEJA <sup>2</sup></span>
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1 leading-normal">
                          Disconformidad no relacionada a los productos o servicios; o malestar respecto a la atención al público.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Detalle de la Reclamación (Explicación del reclamo o queja) *
                    </label>
                    <textarea
                      name="claimDetail"
                      required
                      rows={4}
                      placeholder="Describa claramente los hechos ocurridos..."
                      className="w-full p-3.5 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Pedido del Consumidor / Solución Esperada *
                    </label>
                    <textarea
                      name="consumerRequest"
                      required
                      rows={3}
                      placeholder="Escriba la propuesta de solución o requerimiento que solicita al proveedor..."
                      className="w-full p-3.5 bg-black border border-neutral-700 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>
              </div>

              {/* AVISOS LEGALES INDECOPI */}
              <div className="p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 text-[11px] text-neutral-400 space-y-1 font-mono">
                <p>
                  * La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
                </p>
                <p>
                  * El proveedor debe dar respuesta al reclamo o queja en un plazo no mayor a quince (15) días hábiles, el cual es improrrogable.
                </p>
              </div>

              {/* Botón Enviar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-sm py-4 transition-colors flex items-center justify-center gap-2 uppercase font-mono shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <FileText className="w-5 h-5" />
                    <span>ENVIAR HOJA DE RECLAMACIÓN VIRTUAL</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
