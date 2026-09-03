import React from "react";
import { Users, Shield, ShoppingBag, DollarSign, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function CustomersListPage() {
  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      include: {
        orders: true,
        referrals: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Error cargando usuarios de Neon DB:", err);
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Clientes & Usuarios</h1>
        <p className="text-sm text-slate-500">Listado de usuarios registrados, afiliados y clientes con compras.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">Aún no hay clientes registrados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Cuando los usuarios creen cuentas o realicen compras, se listarán automáticamente aquí.
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
                  <th className="px-6 py-3.5">Órdenes</th>
                  <th className="px-6 py-3.5">Total Gastado</th>
                  <th className="px-6 py-3.5">Código Referido</th>
                  <th className="px-6 py-3.5">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const totalSpent = u.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount), 0);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 text-xs">
                        {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : "Cliente Registrado"}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">{u.email}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' : u.role === 'AFFILIATE' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{u.orders.length} pedidos</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        ${totalSpent.toFixed(2)} USD
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {u.referralCode || "N/A"}
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
