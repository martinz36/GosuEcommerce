"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Crown,
  Sparkles,
  Zap,
  ShoppingBag,
  Eye,
  X,
  Check,
  RefreshCw,
  Tag,
  Plus,
  MessageSquare,
  Send,
  MailCheck,
  MailX,
  Edit3,
  Save,
} from "lucide-react";
import {
  adjustCustomerPointsAction,
  addCustomerNoteAction,
  addCustomerTagAction,
  removeCustomerTagAction,
  updateCustomerMarketingAddressAction,
} from "../actions";

interface CustomerNote {
  id: string;
  content: string;
  createdAt: string | Date;
}

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    title: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string | Date;
  status: string;
  currency?: string;
  totalAmount: number;
  items: OrderItem[];
}

interface Customer {
  id: string;
  name?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  acceptsMarketing?: boolean;
  defaultShippingAddress?: string | null;
  tags?: string[];
  role: string;
  loyaltyPoints: number;
  createdAt: string | Date;
  customerNotes?: CustomerNote[];
  orders: Order[];
}

export default function CustomerProfileClient({ customer }: { customer: Customer }) {
  // Puntos Loyalty
  const [points, setPoints] = useState(customer.loyaltyPoints);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [isSubmittingPoints, setIsSubmittingPoints] = useState(false);

  // Tags
  const [tags, setTags] = useState<string[]>(customer.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Notas Internas (Bitácora)
  const [notes, setNotes] = useState<CustomerNote[]>(customer.customerNotes || []);
  const [noteContent, setNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Dirección & Marketing
  const [phone, setPhone] = useState(customer.phone || "");
  const [address, setAddress] = useState(customer.defaultShippingAddress || "");
  const [acceptsMarketing, setAcceptsMarketing] = useState(customer.acceptsMarketing || false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const displayName = customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Cliente Registrado";
  const totalOrders = customer.orders.length;
  const totalSpent = customer.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const averageTicket = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Helper para formatear montos según moneda
  const formatMoney = (amount: number, currencyCode?: string) => {
    const code = (currencyCode || "PEN").toUpperCase();
    const isPen = code === "PEN" || code === "S/." || code === "SOL";
    const symbol = isPen ? "S/." : code === "EUR" ? "€" : "$";
    const displayCode = isPen ? "PEN" : code === "EUR" ? "EUR" : "USD";
    return `${symbol} ${amount.toFixed(2)} ${displayCode}`;
  };

  // Detectar moneda principal del cliente (por dirección de envío o por órdenes)
  const isPeruCustomer =
    (customer.defaultShippingAddress &&
      (customer.defaultShippingAddress.toLowerCase().includes("perú") ||
        customer.defaultShippingAddress.toLowerCase().includes("peru") ||
        customer.defaultShippingAddress.toLowerCase().includes("lima") ||
        customer.defaultShippingAddress.toLowerCase().includes("san isidro"))) ||
    customer.orders.some((o) => (o.currency || "PEN").toUpperCase() === "PEN");

  const primaryCurrencyCode = isPeruCustomer ? "PEN" : "USD";

  // Determinar Nivel GOSU Loyalty
  const getLoyaltyTier = (pts: number) => {
    if (pts >= 2000)
      return {
        name: "GOSU Champion",
        badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
        icon: Crown,
        min: 2000,
        next: "Nivel Máximo Alcanzado 🏆",
      };
    if (pts >= 500)
      return {
        name: "Meta Player",
        badge: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Sparkles,
        min: 500,
        next: `${2000 - pts} pts para GOSU Champion`,
      };
    return {
      name: "Contender",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Zap,
      min: 0,
      next: `${500 - pts} pts para Meta Player`,
    };
  };

  const tier = getLoyaltyTier(points);
  const TierIcon = tier.icon;

  // Ajuste de Puntos
  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPoints(true);

    const newPoints = Math.max(0, points + pointsDelta);
    setPoints(newPoints);
    setShowPointsModal(false);

    const res = await adjustCustomerPointsAction(customer.id, pointsDelta);
    if (!res.success) {
      alert(res.error || "Error al actualizar los puntos.");
      setPoints(customer.loyaltyPoints);
    }
    setIsSubmittingPoints(false);
  };

  // Tags Handlers
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    const newTag = tagInput.trim().toUpperCase();
    if (tags.includes(newTag)) {
      setTagInput("");
      return;
    }

    setIsAddingTag(true);
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    setTagInput("");

    const res = await addCustomerTagAction(customer.id, newTag);
    if (!res.success) {
      alert(res.error || "Error al agregar tag.");
      setTags(tags);
    }
    setIsAddingTag(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove);
    setTags(updatedTags);

    const res = await removeCustomerTagAction(customer.id, tagToRemove);
    if (!res.success) {
      alert(res.error || "Error al eliminar tag.");
      setTags(tags);
    }
  };

  // Agregar Nota Interna
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    setIsAddingNote(true);
    const tempNote: CustomerNote = {
      id: `temp_${Date.now()}`,
      content: noteContent.trim(),
      createdAt: new Date(),
    };

    setNotes([tempNote, ...notes]);
    setNoteContent("");

    const res = await addCustomerNoteAction(customer.id, tempNote.content);
    if (res.success && res.note) {
      setNotes((prev) => [res.note, ...prev.filter((n) => n.id !== tempNote.id)]);
    } else if (!res.success) {
      alert(res.error || "Error al guardar la nota.");
      setNotes(notes);
    }

    setIsAddingNote(false);
  };

  // Guardar Libreta de Direcciones / Marketing
  const handleSaveMarketingAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAddress(true);

    const res = await updateCustomerMarketingAddressAction(customer.id, {
      phone,
      defaultShippingAddress: address,
      acceptsMarketing,
    });

    if (res.success) {
      setIsEditingAddress(false);
    } else {
      alert(res.error || "Error al actualizar datos.");
    }

    setIsSavingAddress(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 font-sans">
      {/* Enlace de Regreso */}
      <Link
        href="/dashboard/customers"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Directorio de Clientes</span>
      </Link>

      {/* Header del Perfil del Cliente */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-extrabold text-xl flex items-center justify-center font-mono shrink-0 shadow-md">
            {displayName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{displayName}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tier.badge}`}>
                <TierIcon className="w-3.5 h-3.5" />
                <span>{tier.name}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {customer.email} | Registrado el {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Botón Ajustar Puntos */}
        <button
          onClick={() => setShowPointsModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
        >
          <Award className="w-4 h-4" />
          <span>Ajustar Puntos ({points} pts)</span>
        </button>
      </div>

      {/* Métrica Resumen Financiero & Loyalty */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Gastado</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{formatMoney(totalSpent, primaryCurrencyCode)}</span>
          <span className="text-[11px] text-slate-500 block font-mono">En compras procesadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Órdenes</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalOrders}</span>
          <span className="text-[11px] text-slate-500 block font-mono">Compras completadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Promedio</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{formatMoney(averageTicket, primaryCurrencyCode)}</span>
          <span className="text-[11px] text-slate-500 block font-mono">Promedio por orden</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nivel GOSU Loyalty</span>
          <span className="text-xl font-extrabold text-purple-700 font-mono flex items-center gap-1.5 pt-1">
            <TierIcon className="w-5 h-5 text-purple-600" />
            <span>{tier.name}</span>
          </span>
          <span className="text-[11px] text-purple-600 block font-medium pt-0.5">{tier.next}</span>
        </div>
      </div>

      {/* Sección Paso 1 & Paso 3: Libreta de Direcciones, Marketing & Sistema de Tags */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Libreta de Direcciones & Estado de Marketing (Paso 1) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>Libreta de Direcciones & Información de Contacto</span>
            </h3>
            <button
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingAddress ? "Cancelar" : "Editar"}</span>
            </button>
          </div>

          {isEditingAddress ? (
            <form onSubmit={handleSaveMarketingAddress} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+51 987 654 321"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección de Envío por Defecto</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Javier Prado 1234, Dpto 501, San Isidro, Lima, Perú"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="marketingCheck"
                  checked={acceptsMarketing}
                  onChange={(e) => setAcceptsMarketing(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="marketingCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  El cliente acepta recibir campañas de Email Marketing / Promociones
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  {isSavingAddress ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono de Contacto</span>
                <p className="font-mono text-slate-800 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{phone || "No especificado"}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Suscripción a Marketing</span>
                {acceptsMarketing ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <MailCheck className="w-3.5 h-3.5" />
                    <span>Suscrito a Novedades ✓</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    <MailX className="w-3.5 h-3.5" />
                    <span>No Suscrito ✕</span>
                  </span>
                )}
              </div>

              <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dirección de Envío por Defecto</span>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {address || "No se ha configurado dirección de envío por defecto."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sistema de Etiquetas / Tags (Paso 3) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-600" />
              <span>Etiquetas (Tags)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{tags.length} asignadas</span>
          </div>

          <div className="space-y-3">
            {/* Formulario de Adición de Tag */}
            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ej: VIP, B2B, Reviewer..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600"
              />
              <button
                type="submit"
                disabled={isAddingTag || !tagInput.trim()}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isAddingTag ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Añadir</span>
              </button>
            </form>

            {/* Sugerencias Rápidas */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["VIP", "B2B", "REVIEWER", "TCG_COLLECTOR"].map((sug) => {
                if (tags.includes(sug)) return null;
                return (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setTagInput(sug);
                    }}
                    className="text-[10px] font-mono text-slate-400 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 px-2 py-0.5 rounded transition-colors"
                  >
                    +{sug}
                  </button>
                );
              })}
            </div>

            {/* Lista de Tags Tipo Píldora */}
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Sin etiquetas asignadas.</p>
              ) : (
                tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="p-0.5 hover:bg-purple-200 rounded-full text-purple-700 transition-colors"
                      title="Eliminar etiqueta"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección Dividida en 2 Columnas (Paso 2): Historial de Pedidos vs Bitácora de Notas Internas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Historial de Pedidos del Cliente */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-slate-700" />
            <span>Historial de Pedidos ({totalOrders})</span>
          </h3>

          {totalOrders === 0 ? (
            <p className="text-xs text-slate-400 italic py-4">Este cliente aún no ha realizado compras.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Nº Orden</th>
                    <th className="py-3 px-4 font-bold">Fecha</th>
                    <th className="py-3 px-4 font-bold">Estado</th>
                    <th className="py-3 px-4 font-bold text-center">Productos</th>
                    <th className="py-3 px-4 font-bold text-right">Total</th>
                    <th className="py-3 px-4 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customer.orders.map((o) => {
                    const itemCount = o.items ? o.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

                    return (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          <Link href={`/dashboard/orders/${o.id}`} className="hover:text-blue-600 underline">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                              o.status === "PAID" || o.status === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : o.status === "SHIPPED"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono">{itemCount} items</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {formatMoney(Number(o.totalAmount), o.currency)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/dashboard/orders/${o.id}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 inline-block"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
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

        {/* Columna Derecha (1/3): Bitácora / Notas Internas (Customer Support) (Paso 2) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Bitácora / Notas Internas</span>
            </h3>
            <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
              Solo Administradores
            </span>
          </div>

          {/* Formulario de Agregar Nota */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              required
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Escribe un comentario o nota interna sobre este cliente (ej: Cliente solicita factura, prefiere envíos por Olva)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-900"
            />

            <button
              type="submit"
              disabled={isAddingNote || !noteContent.trim()}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAddingNote ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-cyan-400" />}
              <span>Guardar Nota en Bitácora</span>
            </button>
          </form>

          {/* Historial de Notas Registradas */}
          <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1">
            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No hay notas registradas aún.</p>
            ) : (
              notes.map((n) => (
                <div key={n.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-200/60 pb-1">
                    <span className="font-bold text-slate-600">Soporte Admin</span>
                    <span>{new Date(n.createdAt).toLocaleString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-slate-800 whitespace-pre-line leading-relaxed font-medium">{n.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Paso 2: Ajuste Manual de Puntos */}
      {showPointsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-150 font-sans">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-base">
                <Award className="w-5 h-5" />
                <h3>Ajustar Puntos GOSU Loyalty</h3>
              </div>
              <button
                onClick={() => setShowPointsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustPointsSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                <p className="font-semibold text-purple-900">Saldo Actual del Cliente:</p>
                <p className="text-xl font-black text-purple-700 font-mono">{points} pts</p>
                <p className="text-[11px] text-purple-800">
                  Nivel actual: <strong>{tier.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad de Puntos a Ajustar *
                </label>
                <p className="text-[11px] text-slate-400 mb-2">
                  Usa números positivos para acreditar puntos (ej: <code>50</code>) o negativos para restar (ej: <code>-20</code>).
                </p>
                <input
                  type="number"
                  required
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPointsModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPoints}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isSubmittingPoints ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Guardar Nuevo Saldo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
