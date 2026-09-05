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
  const [editingTrackingOrder, setEditingTrackingOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isSubmittingTracking, setIsSubmittingTracking] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Filtrar pedidos por término de búsqueda y estado
  const filteredOrders = orders.filter((order) => {
    const customerName = order.user?.name || `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() || order.guestEmail || "";
    const customerEmail = order.user?.email || order.guestEmail || "";
    const matchSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedStatus === "ALL" || order.status === selectedStatus;

    return matchSearch && matchStatus;
  });

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

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PROCESSING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "SHIPPED":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DELIVERED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "PENDING":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "REFUNDED":
        return "bg-slate-200 text-slate-800 border-slate-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Pagado";
      case "PROCESSING":
        return "En Preparación";
      case "SHIPPED":
        return "Enviado";
      case "DELIVERED":
        return "Entregado / Recibido";
      case "PENDING":
        return "Pendiente de Pago";
      case "CANCELLED":
        return "Cancelado";
      case "REFUNDED":
        return "Reembolsado";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        {/* Buscador */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nº de orden (GOSU-...), cliente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-slate-400"
          />
        </div>

        {/* Filtros por Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-sans text-xs">
          {[
            { id: "ALL", label: "Todos" },
            { id: "PAID", label: "Pagados" },
            { id: "PROCESSING", label: "En Preparación" },
            { id: "SHIPPED", label: "Enviados" },
            { id: "DELIVERED", label: "Entregados" },
            { id: "CANCELLED", label: "Cancelados" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedStatus === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listado Principal en Formato Tabla Compacta */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No se encontraron pedidos</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Intenta cambiar los filtros de búsqueda o el estado seleccionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Nº Orden</th>
                  <th className="py-3.5 px-4 font-bold">Cliente</th>
                  <th className="py-3.5 px-4 font-bold">Fecha</th>
                  <th className="py-3.5 px-4 font-bold">Total</th>
                  <th className="py-3.5 px-4 font-bold">Estado del Pedido</th>
                  <th className="py-3.5 px-4 font-bold">Seguimiento / Tracking</th>
                  <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((order) => {
                  const customerName =
                    order.user?.name ||
                    `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim() ||
                    "Invitado";
                  const customerEmail = order.user?.email || order.guestEmail || "Sin email";
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Nº de Orden (Link al Detalle) */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1.5 group"
                        >
                          <span>{order.orderNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                        <span className="text-[10px] text-slate-400 font-normal block font-sans">
                          {itemCount} {itemCount === 1 ? "producto" : "productos"}
                        </span>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4 max-w-[200px] truncate">
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

                      {/* Selector de Estado Directo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            disabled={updatingStatusId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border appearance-none pr-6 cursor-pointer focus:outline-none ${getStatusBadgeStyle(
                              order.status
                            )}`}
                          >
                            <option value="PENDING">Pendiente</option>
                            <option value="PAID">Pagado</option>
                            <option value="PROCESSING">En Preparación</option>
                            <option value="SHIPPED">Enviado</option>
                            <option value="DELIVERED">Entregado / Recibido</option>
                            <option value="CANCELLED">Cancelado</option>
                            <option value="REFUNDED">Reembolsado</option>
                          </select>
                          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
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

                          {/* Acciones Rápidas */}
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

      {/* Modal de Asignar / Editar Tracking */}
      {editingTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans animate-in fade-in zoom-in duration-150">
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
                  placeholder="Ej: OLVA-984123, DHL-10293, USPS-9921"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
                <p className="font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                  Actualización Automática
                </p>
                <p className="text-[11px] text-blue-700">
                  Al guardar el tracking, el estado del pedido cambiará automáticamente a <strong>ENVIADO (SHIPPED)</strong> y el cliente podrá consultarlo en su panel.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTrackingOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTracking || !trackingNumber.trim()}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingTracking ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
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
