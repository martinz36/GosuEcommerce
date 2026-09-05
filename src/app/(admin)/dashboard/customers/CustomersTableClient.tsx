"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Award,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Shield,
  Eye,
  UserCheck,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";

export interface SerializedCustomer {
  id: string;
  name?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
  loyaltyPoints: number;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function CustomersTableClient({
  initialCustomers,
  currentSort = "",
}: {
  initialCustomers: SerializedCustomer[];
  currentSort?: string;
}) {
  const router = useRouter();
  const [customers, setCustomers] = useState<SerializedCustomer[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Función para obtener nivel de Loyalty
  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return { name: "GOSU Champion", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", icon: Crown };
    if (points >= 500) return { name: "Meta Player", badge: "bg-purple-50 text-purple-700 border-purple-200", icon: Sparkles };
    return { name: "Contender", badge: "bg-slate-100 text-slate-700 border-slate-200", icon: Zap };
  };

  // Manejo de Ordenamiento (Paso 3)
  const handleSortToggle = (column: "points" | "spent") => {
    let nextSort = "";
    if (column === "points") {
      nextSort = currentSort === "points_asc" ? "points_desc" : "points_asc";
    } else {
      nextSort = currentSort === "spent_asc" ? "spent_desc" : "spent_asc";
    }
    router.push(`/dashboard/customers?sort=${nextSort}`);
  };

  // Ordenamiento local inmediato
  const sortedCustomers = [...customers].sort((a, b) => {
    if (currentSort === "points_asc") return a.loyaltyPoints - b.loyaltyPoints;
    if (currentSort === "points_desc") return b.loyaltyPoints - a.loyaltyPoints;
    if (currentSort === "spent_asc") return a.totalSpent - b.totalSpent;
    if (currentSort === "spent_desc") return b.totalSpent - a.totalSpent;
    return 0;
  });

  // Filtrado por búsqueda, rol y nivel de loyalty
  const filteredCustomers = sortedCustomers.filter((c) => {
    const displayName = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim();
    const matchesQuery =
      !searchQuery ||
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || c.role === roleFilter;

    let matchesTier = true;
    if (tierFilter === "CHAMPION") matchesTier = c.loyaltyPoints >= 2000;
    if (tierFilter === "META") matchesTier = c.loyaltyPoints >= 500 && c.loyaltyPoints < 2000;
    if (tierFilter === "CONTENDER") matchesTier = c.loyaltyPoints < 500;

    return matchesQuery && matchesRole && matchesTier;
  });

  // Checkbox helpers
  const isAllSelected =
    filteredCustomers.length > 0 && filteredCustomers.every((c) => selectedIds.includes(c.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCustomers.map((c) => c.id));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Paso 4: Exportación Masiva para Marketing (CSV)
  const handleExportCSV = (targetCustomers: SerializedCustomer[] = filteredCustomers) => {
    if (targetCustomers.length === 0) {
      alert("No hay clientes para exportar.");
      return;
    }

    const headers = [
      "ID Cliente",
      "Nombre",
      "Email",
      "Rol",
      "Puntos Loyalty",
      "Nivel GOSU",
      "Total Ordenes",
      "Total Gastado USD",
      "Fecha Registro",
    ];

    const rows = targetCustomers.map((c) => {
      const displayName = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Cliente";
      const tier = getLoyaltyTier(c.loyaltyPoints).name;
      return [
        `"${c.id}"`,
        `"${displayName.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.role}"`,
        `"${c.loyaltyPoints}"`,
        `"${tier}"`,
        `"${c.ordersCount}"`,
        `"${c.totalSpent.toFixed(2)}"`,
        `"${new Date(c.createdAt).toLocaleDateString()}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `GOSU_Customers_Marketing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedCustomersList = customers.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6 font-sans">
      {/* Barra de Filtros, Buscador, Selector de Rol/Nivel y Exportación Global */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nombre o Email de cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
          </div>

          {/* Paso 3: Selector de Rol y Nivel Loyalty */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Roles</option>
              <option value="CUSTOMER">Cliente (CUSTOMER)</option>
              <option value="AFFILIATE">Afiliado (AFFILIATE)</option>
              <option value="ADMIN">Admin (ADMIN)</option>
            </select>

            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Niveles Loyalty</option>
              <option value="CHAMPION">GOSU Champion (≥2000 pts)</option>
              <option value="META">Meta Player (500-1999 pts)</option>
              <option value="CONTENDER">Contender (&lt;500 pts)</option>
            </select>

            {/* Paso 4: Botón Global 'Exportar CSV' */}
            <button
              onClick={() => handleExportCSV(filteredCustomers)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              title="Exportar clientes filtrados para campañas de Email Marketing"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Paso 4: Barra Flotante de Acciones Masivas */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-cyan-400 text-black px-2.5 py-0.5 rounded-full font-mono text-xs">
              {selectedIds.length}
            </span>
            <span>clientes seleccionados</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => handleExportCSV(selectedCustomersList)}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Seleccionados a CSV (Email Marketing)</span>
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Desmarcar
          </button>
        </div>
      )}

      {/* Tabla Principal de Clientes */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">No se encontraron clientes</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta ajustar el término de búsqueda o cambia los filtros de rol/nivel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button onClick={handleToggleSelectAll} className="text-slate-400 hover:text-slate-700">
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 font-bold">Cliente</th>
                  <th className="py-3.5 px-4 font-bold">Email</th>
                  <th className="py-3.5 px-4 font-bold">Rol</th>
                  
                  {/* Paso 3: Header PUNTOS LOYALTY ordenable */}
                  <th className="py-3.5 px-4 font-bold">
                    <button
                      onClick={() => handleSortToggle("points")}
                      className="inline-flex items-center gap-1 hover:text-slate-900 font-bold uppercase tracking-wider"
                    >
                      <span>PUNTOS LOYALTY</span>
                      {currentSort === "points_asc" && <ArrowUp className="w-3.5 h-3.5 text-purple-600" />}
                      {currentSort === "points_desc" && <ArrowDown className="w-3.5 h-3.5 text-purple-600" />}
                      {currentSort !== "points_asc" && currentSort !== "points_desc" && (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="py-3.5 px-4 font-bold">Nivel GOSU</th>
                  <th className="py-3.5 px-4 font-bold text-center">Órdenes</th>

                  {/* Paso 3: Header TOTAL GASTADO ordenable */}
                  <th className="py-3.5 px-4 font-bold text-right">
                    <button
                      onClick={() => handleSortToggle("spent")}
                      className="inline-flex items-center gap-1 hover:text-slate-900 font-bold uppercase tracking-wider ml-auto"
                    >
                      <span>TOTAL GASTADO</span>
                      {currentSort === "spent_asc" && <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />}
                      {currentSort === "spent_desc" && <ArrowDown className="w-3.5 h-3.5 text-emerald-600" />}
                      {currentSort !== "spent_asc" && currentSort !== "spent_desc" && (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </th>

                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCustomers.map((c) => {
                  const isChecked = selectedIds.includes(c.id);
                  const displayName = c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Cliente Registrado";
                  const tier = getLoyaltyTier(c.loyaltyPoints);
                  const TierIcon = tier.icon;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${isChecked ? "bg-slate-50" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={(e) => handleToggleSelectOne(c.id, e)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Nombre (Paso 1) */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="hover:text-blue-600 hover:underline flex items-center gap-1 group"
                        >
                          <span>{displayName}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 font-mono text-slate-600 text-xs">{c.email}</td>

                      {/* Rol */}
                      <td className="py-4 px-4 text-xs">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.role === "ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : c.role === "AFFILIATE"
                              ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {c.role}
                        </span>
                      </td>

                      {/* Puntos Loyalty */}
                      <td className="py-4 px-4 font-mono font-extrabold text-purple-700">
                        {c.loyaltyPoints} pts
                      </td>

                      {/* Nivel Loyalty Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${tier.badge}`}>
                          <TierIcon className="w-3 h-3" />
                          <span>{tier.name}</span>
                        </span>
                      </td>

                      {/* Órdenes */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">
                        {c.ordersCount}
                      </td>

                      {/* Total Gastado */}
                      <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                        ${c.totalSpent.toFixed(2)} USD
                      </td>

                      {/* Acciones */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                          <span>Ver Perfil</span>
                        </Link>
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
