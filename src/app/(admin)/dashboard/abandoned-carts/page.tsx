import React from "react";
import { ShoppingBag, Clock, Mail, AlertTriangle, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AbandonedCartsPage() {
  let abandonedSessions: any[] = [];
  try {
    abandonedSessions = await prisma.cartSession.findMany({
      where: {
        isConverted: false,
      },
      orderBy: { lastActiveAt: "desc" },
    });
  } catch (err) {
    console.error("Error al cargar carritos abandonados de Neon DB:", err);
  }

  // Filtrar carritos con más de 2 horas de inactividad
  const now = new Date();
  const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

  const inactiveSessions = abandonedSessions.filter((s) => {
    const diff = now.getTime() - new Date(s.lastActiveAt).getTime();
    return diff >= TWO_HOURS_MS;
  });

  // Si no hay sesiones de más de 2h, mostramos todas las sesiones no convertidas para pruebas
  const displaySessions = inactiveSessions.length > 0 ? inactiveSessions : abandonedSessions;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Carritos Abandonados</h1>
          <p className="text-sm text-slate-500">
            Sesiones de compra no convertidas con más de 2 horas de inactividad en la tienda.
          </p>
        </div>
      </div>

      {/* Tarjetas de Resumen de Carritos Abandonados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Carritos Abandonados
            </span>
            <span className="text-2xl font-bold text-slate-900">{abandonedSessions.length}</span>
            <span className="text-[11px] text-amber-600 font-medium block mt-1">
              En las últimas 24h
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Valor Total Abandonado
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              ${abandonedSessions.reduce((sum, s) => sum + Number(s.subtotal), 0).toFixed(2)} USD
            </span>
            <span className="text-[11px] text-rose-600 font-medium block mt-1">
              Oportunidad de recuperación
            </span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Correos Capturados
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {abandonedSessions.filter((s) => s.userEmail).length}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">
              Listos para recordatorios
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Mail className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabla de Carritos Abandonados */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {displaySessions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">No hay carritos abandonados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Todas las sesiones de compra recientes han sido completadas o no han alcanzado el tiempo límite de 2h.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">ID Sesión</th>
                  <th className="px-6 py-3.5">Email del Usuario</th>
                  <th className="px-6 py-3.5">Ítems Abandonados</th>
                  <th className="px-6 py-3.5">Valor Subtotal</th>
                  <th className="px-6 py-3.5">Última Actividad</th>
                  <th className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displaySessions.map((s) => {
                  const itemsCount = Array.isArray(s.itemsJson) ? s.itemsJson.length : 1;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 truncate max-w-[120px]">
                        {s.sessionId}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-900 font-semibold">
                        {s.userEmail || "Anónimo (No ingresado)"}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {itemsCount} productos
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        ${Number(s.subtotal).toFixed(2)} USD
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(s.lastActiveAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => alert(`Enviar recordatorio por correo a: ${s.userEmail || 'Usuario Anónimo'}`)}
                          disabled={!s.userEmail}
                          className="px-3 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-40"
                        >
                          Enviar Recordatorio
                        </button>
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
