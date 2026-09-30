"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  User,
  UserPlus,
  Package,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  MapPin,
  X,
  ChevronDown,
} from "lucide-react";
import {
  searchProductsAction,
  searchCustomersAction,
  createCustomerAction,
  createManualOrderAction,
} from "../actions";

interface SelectedItem {
  productId: string;
  title: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  stock: number;
  imageUrl?: string | null;
}

interface CustomerOption {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
  } | null;
}

export default function CreateOrderClient() {
  const router = useRouter();

  // 1. Estados de Productos
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState<any[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // 2. Estados de Financiamiento Manual
  const [currency, setCurrency] = useState<"PEN" | "USD">("PEN");
  const [shippingAmount, setShippingAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // 3. Estados de Cliente (Combobox & Sub-Form)
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<CustomerOption[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);

  // Modal / Inline Sub-formulario de Nuevo Cliente
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

  // 4. Datos de Envío
  const [streetAddress, setStreetAddress] = useState("");
  const [cityDistrict, setCityDistrict] = useState("Lima");
  const [stateDept, setStateDept] = useState("Lima");
  const [country, setCountry] = useState("PE");
  const [postalCode, setPostalCode] = useState("15001");
  const [contactPhone, setContactPhone] = useState("");

  // 5. Estados de Pago y Logística
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia Bancaria");
  const [fulfillmentStatus, setFulfillmentStatus] = useState<"PROCESSING" | "SHIPPED" | "DELIVERED">("PROCESSING");

  // 6. Submisión Global
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Ref para cerrar dropdowns al hacer click afuera
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProductDropdown(false);
      }
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCustomerDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Búsqueda de Productos con debounce simple
  useEffect(() => {
    if (!productQuery || productQuery.trim().length < 2) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingProducts(true);
      const results = await searchProductsAction(productQuery);
      setProductResults(results);
      setShowProductDropdown(true);
      setIsSearchingProducts(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [productQuery]);

  // Búsqueda de Clientes con debounce simple
  useEffect(() => {
    if (!customerQuery || customerQuery.trim().length < 2) {
      setCustomerResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCustomers(true);
      const results = await searchCustomersAction(customerQuery);
      setCustomerResults(results);
      setShowCustomerDropdown(true);
      setIsSearchingCustomers(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [customerQuery]);

  // Autocompletar dirección si se selecciona cliente existente con dirección
  const handleSelectCustomer = (customer: CustomerOption) => {
    setSelectedCustomer(customer);
    setCustomerQuery(customer.name);
    setShowCustomerDropdown(false);

    if (customer.phone) {
      setContactPhone(customer.phone);
    }
    if (customer.address) {
      setStreetAddress(customer.address.street || "");
      setCityDistrict(customer.address.city || "Lima");
      setStateDept(customer.address.state || "Lima");
      setCountry(customer.address.country || "PE");
      if (customer.address.postalCode) setPostalCode(customer.address.postalCode);
    }
  };

  // Agregar producto seleccionado a la orden
  const handleAddProduct = (prod: any) => {
    const existing = selectedItems.find((i) => i.productId === prod.id);
    const price = currency === "USD" ? prod.priceUSD : prod.pricePEN;

    if (existing) {
      setSelectedItems((prev) =>
        prev.map((i) =>
          i.productId === prod.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          title: prod.title,
          sku: prod.sku,
          unitPrice: price,
          quantity: 1,
          stock: prod.stock,
          imageUrl: prod.imageUrl,
        },
      ]);
    }

    setProductQuery("");
    setShowProductDropdown(false);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as SelectedItem[]
    );
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, unitPrice: Math.max(0, newPrice) } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Crear Cliente al Vuelo
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.trim()) return;

    setIsCreatingCustomer(true);
    const res = await createCustomerAction({
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
    });

    if (res.success && res.user) {
      handleSelectCustomer(res.user);
      setShowNewCustomerForm(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewPhone("");
    } else {
      alert(res.error || "No se pudo crear el cliente");
    }
    setIsCreatingCustomer(false);
  };

  // Totales Financieros
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  // Crear la Orden Manual
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      setFeedback({ type: "error", msg: "Debes seleccionar al menos 1 producto." });
      return;
    }

    if (!selectedCustomer && !newEmail) {
      setFeedback({ type: "error", msg: "Debes seleccionar o ingresar un cliente." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const orderPayload = {
      userId: selectedCustomer?.id || undefined,
      guestEmail: selectedCustomer?.email || newEmail || undefined,
      newCustomer:
        !selectedCustomer && newEmail
          ? {
              firstName: newFirstName,
              lastName: newLastName,
              email: newEmail,
              phone: newPhone,
            }
          : undefined,
      items: selectedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal,
      shippingAmount,
      discountAmount,
      totalAmount,
      currency,
      paymentGateway: `manual_${paymentMethod.toLowerCase().replace(/\s+/g, "_")}`,
      paymentStatus,
      fulfillmentStatus,
      shippingAddress: streetAddress
        ? {
            fullName: selectedCustomer?.name || `${newFirstName} ${newLastName}`.trim(),
            street: streetAddress,
            city: cityDistrict,
            state: stateDept,
            country,
            postalCode,
            phone: contactPhone || selectedCustomer?.phone || undefined,
          }
        : undefined,
    };

    const res = await createManualOrderAction(orderPayload);

    if (res.success) {
      setFeedback({
        type: "success",
        msg: `¡Orden ${res.orderNumber} creada exitosamente! Redirigiendo...`,
      });
      setTimeout(() => {
        router.push("/dashboard/orders");
      }, 1500);
    } else {
      setFeedback({ type: "error", msg: res.error || "Error al procesar la orden manual." });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16 max-w-7xl mx-auto">
      {/* Cabecera y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/orders"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Crear Nueva Orden Manual (Draft Order)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registra ventas directas, órdenes por transferencia o pedidos presenciales.
            </p>
          </div>
        </div>

        {/* Selector de Moneda Base */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setCurrency("PEN")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              currency === "PEN"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            S/. PEN (Soles)
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              currency === "USD"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            $ USD (Dólares)
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-mono font-medium flex items-center gap-3 shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLUMNA IZQUIERDA (7/12): Productos y Desglose Financiero */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Buscador Autocompletado de Productos */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>1. Buscar y Agregar Productos</span>
            </h2>

            <div className="relative" ref={productDropdownRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre de producto o SKU..."
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  onFocus={() => productQuery.trim().length >= 2 && setShowProductDropdown(true)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                />
                {isSearchingProducts && (
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {/* Menú Desplegable de Resultados de Productos */}
              {showProductDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {productResults.length > 0 ? (
                    productResults.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => handleAddProduct(prod)}
                        className="w-full p-3 text-left hover:bg-indigo-50/50 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          {prod.imageUrl ? (
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600">
                              {prod.title}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">
                              SKU: {prod.sku || "N/A"} | Stock:{" "}
                              <span
                                className={
                                  prod.stock > 0 ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"
                                }
                              >
                                {prod.stock} un.
                              </span>
                            </p>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {currency === "USD" ? `$ ${prod.priceUSD.toFixed(2)}` : `S/. ${prod.pricePEN.toFixed(2)}`}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 font-mono">
                      No se encontraron productos activos con ese término.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Lista Dinámica de Productos Seleccionados */}
            {selectedItems.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {selectedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3.5 flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-11 h-11 object-cover rounded-lg border border-slate-200 bg-white"
                          />
                        ) : (
                          <div className="w-11 h-11 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </div>

                      {/* Control de Precio Unitario */}
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-slate-400">
                          {currency === "USD" ? "$" : "S/."}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdatePrice(item.productId, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Control de Cantidad (+/-) */}
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, -1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 font-mono text-xs font-bold text-slate-900 bg-slate-50 border-x border-slate-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal del Item */}
                      <div className="text-right min-w-[70px]">
                        <p className="text-xs font-mono font-extrabold text-slate-900">
                          {currency === "USD"
                            ? `$ ${(item.unitPrice * item.quantity).toFixed(2)}`
                            : `S/. ${(item.unitPrice * item.quantity).toFixed(2)}`}
                        </p>
                      </div>

                      {/* Botón Eliminar */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-2">
                <Package className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-500 font-mono">
                  No hay productos agregados a esta orden.
                </p>
                <p className="text-[11px] text-slate-400">
                  Usa el buscador superior para seleccionar ítems del catálogo.
                </p>
              </div>
            )}
          </div>

          {/* 2. Resumen Financiero y Totales Manuales */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>2. Desglose de Importes y Descuento</span>
            </h2>

            <div className="space-y-3 font-mono text-xs pt-1">
              {/* Subtotal Calculado */}
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Subtotal Productos:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {currency === "USD" ? `$ ${subtotal.toFixed(2)}` : `S/. ${subtotal.toFixed(2)}`}
                </span>
              </div>

              {/* Input Costo de Envío Manual */}
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600 font-medium">Costo de Envío Manual:</span>
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">{currency === "USD" ? "$" : "S/."}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 text-right focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Input Descuento Manual */}
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600 font-medium">Descuento Especial Manual:</span>
                <div className="flex items-center gap-1">
                  <span className="text-rose-500 font-bold">- {currency === "USD" ? "$" : "S/."}</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-bold text-rose-600 text-right focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Total Final */}
              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900 text-sm">
                <span className="font-bold text-slate-900 uppercase">TOTAL DE LA ORDEN:</span>
                <span className="font-extrabold text-indigo-600 text-lg">
                  {currency === "USD" ? `$ ${totalAmount.toFixed(2)}` : `S/. ${totalAmount.toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (5/12): Cliente, Envío y Estado */}
        <div className="lg:col-span-5 space-y-6">
          {/* 3. Selección o Registro de Cliente (Combobox CRÍTICO) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600" />
                <span>3. Cliente Asignado</span>
              </h2>

              <button
                type="button"
                onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Crear Nuevo Cliente</span>
              </button>
            </div>

            {/* Sub-formulario Flotante/Inline de Nuevo Cliente */}
            {showNewCustomerForm && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                  <span className="text-xs font-bold text-indigo-950 font-mono flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-indigo-600" />
                    Registrar Nuevo Cliente al Vuelo
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewCustomerForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Nombre</label>
                    <input
                      type="text"
                      required
                      value={newFirstName}
                      onChange={(e) => setNewFirstName(e.target.value)}
                      placeholder="Ej. Carlos"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Apellidos</label>
                    <input
                      type="text"
                      value={newLastName}
                      onChange={(e) => setNewLastName(e.target.value)}
                      placeholder="Ej. Pérez"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="carlos@email.com"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">Teléfono / Celular</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+51 987654321"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreateCustomerSubmit}
                  disabled={isCreatingCustomer}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingCustomer ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>GUARDAR Y SELECCIONAR CLIENTE</span>
                  )}
                </button>
              </div>
            )}

            {/* Tarjeta de Cliente Seleccionado O Combobox de Búsqueda */}
            {selectedCustomer ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold font-mono text-sm">
                    {selectedCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedCustomer.name}</p>
                    <p className="text-[11px] font-mono text-slate-500">{selectedCustomer.email}</p>
                    {selectedCustomer.phone && (
                      <p className="text-[10px] text-slate-400">Télf: {selectedCustomer.phone}</p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerQuery("");
                  }}
                  className="text-xs font-mono font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative" ref={customerDropdownRef}>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por email o nombre..."
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    onFocus={() => customerQuery.trim().length >= 2 && setShowCustomerDropdown(true)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900 transition-all"
                  />
                  {isSearchingCustomers && (
                    <Loader2 className="w-4 h-4 text-cyan-600 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Menú Desplegable Combobox de Clientes */}
                {showCustomerDropdown && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {customerResults.length > 0 ? (
                      customerResults.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => handleSelectCustomer(cust)}
                          className="w-full p-3 text-left hover:bg-cyan-50/50 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-cyan-600">
                              {cust.name}
                            </p>
                            <p className="text-[11px] font-mono text-slate-400">{cust.email}</p>
                          </div>
                          {cust.phone && (
                            <span className="text-[11px] font-mono text-slate-400">
                              {cust.phone}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-400 font-mono">
                        No se encontraron clientes. Haz clic en "+ Crear Nuevo Cliente".
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Datos Logísticos de Envío */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>4. Dirección de Entrega</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección / Calle y Número
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="Ej. Av. Javier Prado 123, Depto 401"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Distrito / Ciudad</label>
                  <input
                    type="text"
                    value={cityDistrict}
                    onChange={(e) => setCityDistrict(e.target.value)}
                    placeholder="Miraflores"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departamento / Estado</label>
                  <input
                    type="text"
                    value={stateDept}
                    onChange={(e) => setStateDept(e.target.value)}
                    placeholder="Lima"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">País (ISO Code)</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase())}
                    placeholder="PE"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono de Contacto</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+51 987654321"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. Estado de Pago y Logística */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-600" />
              <span>5. Estado de Pago y Logística</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estado de Pago</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("PAID")}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border flex items-center justify-center gap-2 transition-all ${
                      paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PAGADO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentStatus("PENDING")}
                    className={`py-2 px-3 rounded-lg text-xs font-mono font-bold border flex items-center justify-center gap-2 transition-all ${
                      paymentStatus === "PENDING"
                        ? "bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-500/20"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>PENDIENTE DE PAGO</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medio de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="Transferencia Bancaria">Transferencia Bancaria / BCP / Interbank</option>
                  <option value="Yape / Plin">Yape / Plin</option>
                  <option value="Efectivo en Tienda">Efectivo en Tienda</option>
                  <option value="POS / Tarjeta Presencial">POS / Tarjeta Presencial</option>
                  <option value="Stripe / Pasarela">Stripe / Pasarela Externa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estado Logístico Inicial</label>
                <select
                  value={fulfillmentStatus}
                  onChange={(e) => setFulfillmentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none"
                >
                  <option value="PROCESSING">En Preparación (Processing)</option>
                  <option value="SHIPPED">Enviado (Shipped)</option>
                  <option value="DELIVERED">Entregado / Recibido (Delivered)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botón Final Submit de la Orden */}
          <button
            type="submit"
            disabled={isSubmitting || selectedItems.length === 0}
            className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-extrabold text-sm transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>GUARDANDO ORDEN EN NEON DB...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>GUARDAR Y GENERAR ORDEN MANUAL</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
