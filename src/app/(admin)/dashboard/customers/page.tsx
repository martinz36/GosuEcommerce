import React from "react";
import { Users, Award, UserCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CustomersTableClient, { SerializedCustomer } from "./CustomersTableClient";

export const revalidate = 0;

interface PageProps {
  searchParams?: {
    sort?: string;
  };
}

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const sort = searchParams?.sort || "";

  let orderByClause: any = { createdAt: "desc" };
  if (sort === "points_asc") orderByClause = { loyaltyPoints: "asc" };
  if (sort === "points_desc") orderByClause = { loyaltyPoints: "desc" };

  let users: any[] = [];
  try {
    if (process.env.DATABASE_URL) {
      users = await prisma.user.findMany({
        include: {
          orders: true,
          referrals: true,
        },
        orderBy: orderByClause,
      });
    }
  } catch (err) {
    console.error("Error al cargar clientes de Neon DB:", err);
  }

  const serializedCustomers: SerializedCustomer[] = users.map((u) => {
    const totalSpent = u.orders ? u.orders.reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0) : 0;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      loyaltyPoints: u.loyaltyPoints || 0,
      ordersCount: u.orders ? u.orders.length : 0,
      totalSpent,
      createdAt: u.createdAt.toISOString ? u.createdAt.toISOString() : new Date(u.createdAt).toISOString(),
    };
  });

  // Re-ordenar localmente si el sort fue por 'spent'
  if (sort === "spent_asc") {
    serializedCustomers.sort((a, b) => a.totalSpent - b.totalSpent);
  } else if (sort === "spent_desc") {
    serializedCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  const totalPoints = serializedCustomers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const totalConverted = serializedCustomers.filter((c) => c.ordersCount > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Directorio CRM de Clientes & Programa GOSU® Loyalty
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Gestiona tus clientes, consulta historiales de compra, ajusta puntos de fidelidad y exporta audiencias para email marketing.
        </p>
      </div>

      {/* Tarjetas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Total Clientes Registrados
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">{serializedCustomers.length}</span>
            <span className="text-[11px] text-slate-400 font-medium block mt-1">En base de datos Neon DB</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Puntos GOSU Emitidos
            </span>
            <span className="text-2xl font-black text-purple-700 font-mono">
              {totalPoints} pts
            </span>
            <span className="text-[11px] text-purple-600 font-medium block mt-1">Programa GOSU® Loyalty</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-1">
              Clientes con Compras
            </span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {totalConverted}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">Clientes Compradores</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Componente Cliente con Búsqueda, Checkboxes, Filtros y Exportación */}
      <CustomersTableClient initialCustomers={serializedCustomers} currentSort={sort} />
    </div>
  );
}
