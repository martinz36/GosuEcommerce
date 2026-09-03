import React from "react";
import { Users, Award, ShoppingBag, DollarSign, UserCheck, Shield } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminCustomersPage() {
  let users: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      users = await prisma.user.findMany({
        where: { role: "CUSTOMER" },
        include: {
          orders: true,
          referrals: true,
        },
        orderBy: { createdAt: "desc" },
      });

      // Si aún no hay clientes con rol CUSTOMER, cargamos todos los usuarios registrados
      if (users.length === 0) {
        users = await prisma.user.findMany({
          include: { orders: true, referrals: true },
          orderBy: { createdAt: "desc" },
        });
      }
    }
  } catch (err) {
    console.error("Error al cargar clientes de Neon DB:", err);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-body">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Clientes & Programa de Fidelización</h1>
        <p className="text-sm text-slate-500">
          Listado de clientes registrados con NextAuth, historial de pedidos y saldo de Puntos de Fidelidad.
        </p>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Total Clientes
            </span>
            <span className="text-2xl font-bold text-slate-900">{users.length}</span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">Registrados en Neon DB</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Puntos Emitidos
            </span>
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {users.reduce((sum, u) => sum + (u.loyaltyPoints || 0), 0)} pts
            </span>
            <span className="text-[11px] text-purple-600 font-medium block mt-1">Programa GOSU® Loyalty</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Clientes con Compras
            </span>
            <span className="text-2xl font-bold text-slate-900">
              {users.filter((u) => u.orders && u.orders.length > 0).length}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">Convertidos</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabla de Datos de Clientes */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Aún no hay clientes registrados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cuando los clientes se registren en la tienda a través de NextAuth, se listarán automáticamente aquí.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Rol</th>
                  <th className="px-6 py-3.5">Puntos Loyalty</th>
                  <th className="px-6 py-3.5">Órdenes</th>
                  <th className="px-6 py-3.5">Total Gastado</th>
                  <th className="px-6 py-3.5">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const totalSpent = u.orders ? u.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0) : 0;
                  const displayName = u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : u.name || "Cliente Registrado";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                        {displayName}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-purple-700">
                        {u.loyaltyPoints || 0} pts
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        {u.orders ? u.orders.length : 0} pedidos
                      </td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        ${totalSpent.toFixed(2)} USD
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
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
