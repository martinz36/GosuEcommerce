"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  FileText,
  Package,
  Send,
  CheckCheck,
  RefreshCw,
  X,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Download,
  Calendar,
  Printer,
  CheckSquare,
  Square,
  SlidersHorizontal,
  CreditCard,
  Filter,
} from "lucide-react";
import { updateOrderStatusAction, updateOrderTrackingAction } from "./actions";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    title: string;
    imageUrl?: string | null;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string | Date;
  status: "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  totalAmount: number;
  subtotal: number;
  guestEmail?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippingAddressJson?: any;
  user?: {
    name?: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  items: OrderItem[];
}

export default function OrdersTableClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<"ALL" | "TODAY" | "LAST_7_DAYS" | "THIS_MONTH" | "CUSTOM">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Paso 1: Selección Múltiple (Checkboxes & Bulk Actions)
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkTargetStatus, setBulkTargetStatus] = useState<string>("PROCESSING");
  const [showPackingSlipModal, setShowPackingSlipModal] = useState(false);

  // Estados para modal de tracking individual
  const [editingTrackingOrder, setEditingTrackingOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // 1. Filtrado dinámico por búsqueda, estado y rango de fechas (Paso 4)
  const filteredOrders = orders.filter((order) => {
    const customerName = order.user?.name || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || order.guestEmail || "";
    const customerEmail = order.user?.email || order.guestEmail || "";
    const matchSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    // Filtro por Fechas
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    let matchDate = true;

    if (dateFilter === "TODAY") {
      matchDate = orderDate.toDateString() === now.toDateString();
    } else if (dateFilter === "LAST_7_DAYS") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchDate = orderDate >= sevenDaysAgo;
    } else if (dateFilter === "THIS_MONTH") {
      matchDate = orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === "CUSTOM") {
      if (startDate) {
        matchDate = matchDate && orderDate >= new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchDate = matchDate && orderDate <= end;
      }
    }

    return matchSearch && matchStatus && matchDate;
  });

  // Checkbox helpers
  const isAllSelected =
    filteredOrders.length > 0 && filteredOrders.every((o) => selectedOrderIds.includes(o.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((item) => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  // Cambio de estado individual
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
    );

    try {
      await updateOrderStatusAction(orderId, newStatus);
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
    setUpdatingStatusId(null);
  };

  // Acciones Masivas
  const handleExecuteBulkStatusChange = async () => {
    if (selectedOrderIds.length === 0) return;
    setShowBulkStatusModal(false);

    setOrders((prev) =>
      prev.map((o) => (selectedOrderIds.includes(o.id) ? { ...o, status: bulkTargetStatus as any } : o))
    );

    for (const id of selectedOrderIds) {
      await updateOrderStatusAction(id, bulkTargetStatus);
    }
    setSelectedOrderIds([]);
  };

  // Paso 3: Exportación Global o Masiva a CSV
  const handleExportCSV = (targetOrders: Order[] = filteredOrders) => {
    if (targetOrders.length === 0) {
      alert("No hay pedidos para exportar.");
      return;
    }

    const headers = [
      "Nº Orden",
      "Fecha Creacion",
      "Cliente",
      "Email",
      "Total USD",
      "Estado Pago",
      "Estado Logistica",
      "Numero Tracking",
      "Cantidad Items",
    ];

    const rows = targetOrders.map((o) => {
      const customerName = o.user?.name || `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.trim() || o.guestEmail || "Invitado";
      const customerEmail = o.user?.email || o.guestEmail || "Sin email";
      const paymentStatus = o.status === "REFUNDED" ? "Reembolsado" : "Pagado (Stripe)";
      const fulfillmentStatus =
        o.status === "DELIVERED"
          ? "Entregado"
          : o.status === "SHIPPED"
          ? "Enviado"
          : o.status === "CANCELLED"
          ? "Cancelado"
          : "En Preparación";
      const totalItems = o.items.reduce((sum, i) => sum + i.quantity, 0);

      return [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString()}"`,
        `"${customerName.replace(/"/g, '""')}"`,
        `"${customerEmail}"`,
        `"${Number(o.totalAmount).toFixed(2)}"`,
        `"${paymentStatus}"`,
        `"${fulfillmentStatus}"`,
        `"${o.trackingNumber || ""}"`,
        `"${totalItems}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Gosu_Orders_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenTrackingModal = (order: Order) => {
    setEditingTrackingOrder(order);
    setTrackingNumber(order.trackingNumber || "");
    setTrackingUrl(order.trackingUrl || "");
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrackingOrder) return;

    setIsSubmittingTracking(true);
    const formData = new FormData();
    formData.append("trackingNumber", trackingNumber);
    formData.append("trackingUrl", trackingUrl);
    if (editingTrackingOrder.status !== "DELIVERED") {
      formData.append("status", "SHIPPED");
    }

    try {
      await updateOrderTrackingAction(editingTrackingOrder.id, formData);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === editingTrackingOrder.id
            ? {
                ...o,
                trackingNumber: trackingNumber.trim() || null,
                trackingUrl: trackingUrl.trim() || null,
                status: o.status !== "DELIVERED" ? "SHIPPED" : o.status,
              }
            : o
        )
      );
      setEditingTrackingOrder(null);
    } catch (err) {
      console.error("Error guardando tracking:", err);
    }
    setIsSubmittingTracking(false);
  };

  // Paso 2: Renderizado de Badges Separados (Pago vs Logística)
  const renderPaymentStatusBadge = (status: string) => {
    if (status === "REFUNDED") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
          <RefreshCw className="w-3 h-3 text-slate-500" /> Reembolsado
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CreditCard className="w-3 h-3 text-emerald-600" /> Pagado
      </span>
    );
  };

  const renderFulfillmentStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCheck className="w-3 h-3 text-purple-600" /> Entregado / Recibido
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" /> Enviado
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" /> Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Package className="w-3 h-3 text-amber-600" /> En Preparación
          </span>
        );
    }
  };

  const selectedOrdersList = orders.filter((o) => selectedOrderIds.includes(o.id));

  return (
    <div className="space-y-6 font-sans">
      {/* Barra de Filtros, Buscador, Selector de Fechas y Exportación Global (Paso 3 y 4) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Buscador */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nº de orden, cliente o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all font-medium"
            />
          </div>

          {/* Paso 4: Selector de Fechas (Date Range Picker) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 ml-2" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-slate-700 font-bold text-xs py-1 px-2 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todas las fechas</option>
                <option value="TODAY">Hoy</option>
                <option value="LAST_7_DAYS">Últimos 7 Días</option>
                <option value="THIS_MONTH">Este Mes</option>
                <option value="CUSTOM">Rango Personalizado...</option>
              </select>
            </div>

            {dateFilter === "CUSTOM" && (
              <div className="flex items-center gap-2 animate-in fade-in duration-150">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
                <span className="text-slate-400">a</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            )}

            {/* Paso 3: Botón Global de Exportación a CSV */}
            <button
              onClick={() => handleExportCSV(filteredOrders)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              title="Exportar órdenes filtradas a archivo CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Estado Logístico */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 text-xs font-semibold">
          {[
            { id: "ALL", label: `Todos (${orders.length})` },
            { id: "PAID", label: "Pagados" },
            { id: "PROCESSING", label: "En Preparación" },
            { id: "SHIPPED", label: "Enviados" },
            { id: "DELIVERED", label: "Entregados" },
            { id: "CANCELLED", label: "Cancelados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? "bg-slate-900 text-white font-bold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Paso 1: Floating Action Bar (Barra Flotante de Acciones Masivas) */}
      {selectedOrderIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="bg-emerald-400 text-black px-2.5 py-0.5 rounded-full font-mono text-xs">
              {selectedOrderIds.length}
            </span>
            <span>pedidos seleccionados</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV(selectedOrdersList)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Exportar a CSV</span>
            </button>

            <button
              onClick={() => setShowPackingSlipModal(true)}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Hojas de Empaque (PDF)</span>
            </button>

            <button
              onClick={() => setShowBulkStatusModal(true)}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Actualizar Estado</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => setSelectedOrderIds([])}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Desmarcar
          </button>
        </div>
      )}

      {/* Tabla Principal de Pedidos con Checkboxes y Doble Estado (Paso 1 y Paso 2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No se encontraron pedidos</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta ajustar el término de búsqueda, los filtros de estado o el rango de fechas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  {/* Checkbox Select All */}
                  <th className="py-3.5 px-4 w-10 text-center">
                    <button onClick={handleToggleSelectAll} className="text-slate-400 hover:text-slate-700">
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-slate-900" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 font-bold">Nº Orden</th>
                  <th className="py-3.5 px-4 font-bold">Cliente</th>
                  <th className="py-3.5 px-4 font-bold">Fecha</th>
                  <th className="py-3.5 px-4 font-bold">Total</th>
                  {/* Paso 2: Separación Visual de Estados (Pago vs Logística) */}
                  <th className="py-3.5 px-4 font-bold">Estado de Pago</th>
                  <th className="py-3.5 px-4 font-bold">Estado de Envío (Logística)</th>
                  <th className="py-3.5 px-4 font-bold">Seguimiento / Tracking</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const isChecked = selectedOrderIds.includes(order.id);
                  const customerName =
                    order.user?.name ||
                    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
                    "Invitado";
                  const customerEmail = order.user?.email || order.guestEmail || "Sin email";
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${isChecked ? "bg-slate-50" : ""}`}
                    >
                      {/* Checkbox de fila */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleSelectOne(order.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Nº Orden */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1 group"
                        >
                          <span>{order.orderNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className="text-[10px] text-slate-400 font-normal block font-sans">
                          {itemCount} {itemCount === 1 ? "producto" : "productos"}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4 max-w-[180px] truncate">
                        <span className="font-semibold text-slate-900 block truncate">{customerName}</span>
                        <span className="text-slate-500 text-[11px] font-mono block truncate">{customerEmail}</span>
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString()} <br />
                        <span className="text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 whitespace-nowrap text-sm">
                        ${Number(order.totalAmount).toFixed(2)} USD
                      </td>

                      {/* Paso 2: Badge Estado de Pago */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderPaymentStatusBadge(order.status)}
                      </td>

                      {/* Paso 2: Badge & Selector Estado de Envío (Logística) */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingStatusId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                          >
                            <option value="PROCESSING">En Preparación</option>
                            <option value="SHIPPED">Enviado</option>
                            <option value="DELIVERED">Entregado / Recibido</option>
                            <option value="CANCELLED">Cancelado</option>
                            <option value="REFUNDED">Reembolsado</option>
                          </select>
                          <div className="cursor-pointer hover:opacity-90 transition-opacity">
                            {renderFulfillmentStatusBadge(order.status)}
                          </div>
                        </div>
                      </td>

                      {/* Tracking / Guía */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.trackingNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-mono text-[11px] font-bold">
                              {order.trackingNumber}
                            </span>
                            <button
                              onClick={() => handleOpenTrackingModal(order)}
                              className="text-[11px] text-slate-500 hover:text-slate-900 underline"
                              title="Editar tracking"
                            >
                              Editar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenTrackingModal(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5 text-blue-600" />
                            <span>+ Añadir Guía</span>
                          </button>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Ver Detalle del Pedido"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                          </Link>

                          {order.status !== "SHIPPED" && order.status !== "DELIVERED" && (
                            <button
                              onClick={() => handleOpenTrackingModal(order)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Marcar como Enviado"
                            >
                              <Send className="w-3 h-3" />
                              <span>Enviar</span>
                            </button>
                          )}

                          {order.status === "SHIPPED" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "DELIVERED")}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="Marcar como Recibido/Entregado"
                            >
                              <CheckCheck className="w-3 h-3" />
                              <span>Recibido</span>
                            </button>
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

      {/* Modal Masivo de Cambio de Estado */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">
              Actualizar Estado Masivo ({selectedOrderIds.length} pedidos)
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Selecciona el nuevo estado logístico:
              </label>
              <select
                value={bulkTargetStatus}
                onChange={(e) => setBulkTargetStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
              >
                <option value="PROCESSING">En Preparación (Processing)</option>
                <option value="SHIPPED">Enviado (Shipped)</option>
                <option value="DELIVERED">Entregado / Recibido (Delivered)</option>
                <option value="CANCELLED">Cancelado (Cancelled)</option>
                <option value="REFUNDED">Reembolsado (Refunded)</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkStatusModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkStatusChange}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Confirmar Cambio Masivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Imprimible de Hojas de Empaque (PDF Masivo - Paso 1) */}
      {showPackingSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Hojas de Empaque Masivas ({selectedOrdersList.length} pedidos)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Hojas</span>
                </button>
                <button
                  onClick={() => setShowPackingSlipModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-8 font-sans">
              {selectedOrdersList.map((order, idx) => {
                const customerName = order.user?.name || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || order.guestEmail || "Cliente";
                const shippingInfo = order.shippingAddressJson;

                return (
                  <div key={order.id} className="p-6 border border-slate-200 rounded-xl space-y-4 page-break-after">
                    <div className="flex justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h2 className="font-extrabold text-lg text-slate-900">GOSU® TCG GEAR</h2>
                        <p className="text-xs text-slate-500 font-mono">HOJA DE EMPAQUE / PACKING SLIP</p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-bold text-base text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="font-bold uppercase text-slate-400 text-[10px]">Cliente:</p>
                        <p className="font-semibold text-slate-900">{customerName}</p>
                        <p className="text-slate-600 font-mono">{order.user?.email || order.guestEmail}</p>
                      </div>
                      <div>
                        <p className="font-bold uppercase text-slate-400 text-[10px]">Dirección de Envío:</p>
                        {shippingInfo ? (
                          <p className="text-slate-800">
                            {shippingInfo.address?.line1 || shippingInfo.street}, {shippingInfo.address?.city || shippingInfo.city} ({shippingInfo.address?.country || shippingInfo.country})
                          </p>
                        ) : (
                          <p className="text-slate-400 italic">Despacho estándar</p>
                        )}
                      </div>
                    </div>

                    <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                      <thead className="bg-slate-50 font-mono uppercase text-[10px] text-slate-500">
                        <tr>
                          <th className="p-2 border-b">Cant.</th>
                          <th className="p-2 border-b">Producto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {order.items.map((item: any) => (
                          <tr key={item.id}>
                            <td className="p-2 font-mono font-bold text-slate-900">{item.quantity}x</td>
                            <td className="p-2 font-semibold text-slate-800">{item.product?.title || "Accesorio TCG"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Tracking Individual */}
      {editingTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Guía de Seguimiento ({editingTrackingOrder.orderNumber})
                </h3>
              </div>
              <button
                onClick={() => setEditingTrackingOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de Guía / Tracking Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: OLVA-984123, DHL-10293"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enlace de Rastreo (URL opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://olvacourier.com/rastreo?id=123"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTrackingOrder(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTracking || !trackingNumber.trim()}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingTracking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Guardar & Notificar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
