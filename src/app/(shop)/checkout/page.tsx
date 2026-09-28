"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  Store,
  CreditCard,
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  MapPin,
  User,
  Mail,
  Phone,
  Tag,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/providers/StoreProvider";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const { items, discount, loyaltyPointsUsed, getSubtotal, getDiscountAmount } = useCartStore();
  const { currency, countryCode } = useStoreSettings();

  // Pasarela activa desde la BD (stripe vs mercadopago)
  const [activeGateway, setActiveGateway] = useState<string>("stripe");
  const [isLoadingGateway, setIsLoadingGateway] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Método de entrega (SHIPPING vs PICKUP)
  const [deliveryMethod, setDeliveryMethod] = useState<"SHIPPING" | "PICKUP">("SHIPPING");

  // Formulario de Contacto y Envío
  const initialGuestEmail = searchParams.get("guestEmail") || "";
  const [email, setEmail] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [country, setCountry] = useState<string>("PE");

  // Pre-cargar datos del usuario autenticado o query param
  useEffect(() => {
    if (session?.user) {
      if (session.user.email) setEmail(session.user.email);
      if (session.user.name) {
        const parts = session.user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    } else if (initialGuestEmail) {
      setEmail(initialGuestEmail);
    }
  }, [session, initialGuestEmail]);

  // Cargar la pasarela de pago activa desde el backend
  useEffect(() => {
    async function fetchGateway() {
      try {
        const res = await fetch("/api/settings/payments");
        if (res.ok) {
          const data = await res.json();
          if (data.activePaymentGateway) {
            setActiveGateway(data.activePaymentGateway.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Error al cargar la pasarela de pago activa:", err);
      } finally {
        setIsLoadingGateway(false);
      }
    }
    fetchGateway();
  }, []);

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirigir a inicio únicamente si el cliente ya hidrató y el carrito realmente está vacío
  useEffect(() => {
    if (isMounted && items.length === 0) {
      router.replace("/");
    }
  }, [isMounted, items.length, router]);

  const subtotal = getSubtotal();
  const discountVal = getDiscountAmount();
  const total = Math.max(0, subtotal - discountVal);
  const currencySymbol = (countryCode === "PE" || currency.toLowerCase() === "pen") ? "S/." : "$";
  const currencyText = (countryCode === "PE" || currency.toLowerCase() === "pen") ? "PEN" : "USD";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validaciones básicas
    if (!email || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }
    if (!firstName.trim()) {
      setErrorMessage("Por favor ingresa tu nombre.");
      return;
    }
    if (deliveryMethod === "SHIPPING") {
      if (!street.trim() || !city.trim() || !state.trim()) {
        setErrorMessage("Por favor completa los datos de la dirección de envío (Dirección, Distrito/Ciudad y Departamento).");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const shippingAddressData = deliveryMethod === "SHIPPING" ? {
        name: fullName,
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country || "PE",
        phone: phone.trim(),
      } : null;

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          discountCode: discount,
          loyaltyPointsUsed,
          currency: currency.toLowerCase(),
          countryCode,
          isPickup: deliveryMethod === "PICKUP",
          pickupAddress: "Tienda Principal GOSU® TCG - Surco, Lima, Perú",
          guestEmail: email.trim(),
          guestName: fullName,
          guestPhone: phone.trim(),
          shippingAddress: shippingAddressData,
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // Redirección directa a la pasarela activa (Stripe o Mercado Pago)
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Ocurrió un error al preparar el pago.");
      }
    } catch (err: any) {
      console.error("Error procesando checkout:", err);
      setErrorMessage(err.message || "No se pudo conectar con la pasarela de pagos.");
      setIsSubmitting(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 font-body">
        <Loader2 className="w-8 h-8 animate-spin text-accent-cyan mb-3" />
        <p className="text-xs font-mono text-neutral-400">Cargando datos de tu pedido...</p>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-body py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Superior y Pasos de Navegación */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Volver a la tienda</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              <span>FINALIZAR COMPRA</span>
              <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-accent-cyan font-bold">
                {items.length} {items.length === 1 ? "Producto" : "Productos"}
              </span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CHECKOUT 100% SEGURO</span>
          </div>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-mono flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Layout Principal de 2 Columnas */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Datos de Contacto y Envío (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Sección 1: Información de Contacto */}
            <div className="p-6 bg-neutral-900/70 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2 text-white">
                  <User className="w-4 h-4 text-accent-cyan" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider">1. Datos de Contacto</h2>
                </div>
                {!session && (
                  <Link
                    href="/account/login?callbackUrl=/checkout"
                    className="text-[11px] font-mono text-accent-cyan hover:underline"
                  >
                    ¿Ya tienes cuenta? Inicia sesión
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Martin"
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Pérez"
                    className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                    Teléfono / Celular (Para coordinación del envío)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+51 987 654 321"
                      className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Método de Entrega */}
            <div className="p-6 bg-neutral-900/70 rounded-2xl border border-neutral-800 space-y-4">
              <div className="flex items-center gap-2 text-white border-b border-neutral-800/80 pb-3">
                <Truck className="w-4 h-4 text-accent-pink" />
                <h2 className="font-extrabold text-sm uppercase tracking-wider">2. Opciones de Despacho</h2>
              </div>

              {/* Selector Tabs: Envío vs Recojo */}
              <div className="grid grid-cols-2 gap-3 p-1 bg-black rounded-xl border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod("SHIPPING")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    deliveryMethod === "SHIPPING"
                      ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Truck className="w-4 h-4 text-accent-cyan" />
                  <span>Envío a Domicilio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod("PICKUP")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    deliveryMethod === "PICKUP"
                      ? "bg-neutral-800 text-white shadow-md border border-neutral-700"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Store className="w-4 h-4 text-accent-pink" />
                  <span>Recojo en Tienda</span>
                </button>
              </div>

              {/* Campos de Dirección de Envío */}
              {deliveryMethod === "SHIPPING" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                      Dirección Completa (Calle, Av., Nro, Dpto/Mz) *
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required={deliveryMethod === "SHIPPING"}
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Ej. Av. Los Conquistadores 154, Dpto 302"
                        className="w-full pl-10 pr-4 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                      Distrito / Ciudad *
                    </label>
                    <input
                      type="text"
                      required={deliveryMethod === "SHIPPING"}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ej. Santiago de Surco"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                      Departamento / Provincia *
                    </label>
                    <input
                      type="text"
                      required={deliveryMethod === "SHIPPING"}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Ej. Lima"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                      Código Postal (Opcional)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="15033"
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 mb-1 uppercase font-bold">
                      País
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-black border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-accent-cyan"
                    >
                      <option value="PE">Perú (PEN S/.)</option>
                      <option value="US">Estados Unidos (USD $)</option>
                      <option value="MX">México (MXN / USD)</option>
                      <option value="CL">Chile (CLP / USD)</option>
                      <option value="CO">Colombia (COP / USD)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-black/60 rounded-xl border border-neutral-800 text-xs text-neutral-300 space-y-2">
                  <div className="flex items-center gap-2 text-accent-pink font-bold uppercase font-mono">
                    <Store className="w-4 h-4" />
                    <span>Punto de Recojo Gratuito</span>
                  </div>
                  <p>
                    <strong>Tienda Principal GOSU® TCG:</strong> Jr. Los Conquistadores 154, Santiago de Surco, Lima, Perú.
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Horario de atención: Lunes a Sábado de 11:00 AM a 8:00 PM. Te notificaremos por correo cuando tu pedido esté listo para recoger.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Resumen del Pedido & Botón de Pago (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-neutral-900/90 rounded-2xl border border-neutral-800 space-y-6 shadow-2xl sticky top-24">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="flex items-center gap-2 text-white">
                  <CreditCard className="w-4 h-4 text-accent-cyan" />
                  <h2 className="font-extrabold text-sm uppercase tracking-wider">Resumen de Compra</h2>
                </div>
                <span className="text-xs font-mono font-bold text-accent-pink">
                  GOSU® CHECKOUT
                </span>
              </div>

              {/* Lista de Ítems */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        className="w-10 h-10 object-cover rounded-lg bg-neutral-950 border border-neutral-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-white block truncate">{item.title}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">Cant: {item.quantity}</span>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-white shrink-0">
                      {currencySymbol} {(Number(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Desglose Financiero */}
              <div className="space-y-2 pt-4 border-t border-neutral-800 text-xs font-mono">
                <div className="flex justify-between text-neutral-400">
                  <span>Subtotal</span>
                  <span className="text-white">{currencySymbol} {subtotal.toFixed(2)}</span>
                </div>

                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Cupón ({discount?.code})
                    </span>
                    <span>-{currencySymbol} {discountVal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-400">
                  <span>Envío</span>
                  <span className="text-emerald-400 font-bold">
                    {deliveryMethod === "PICKUP" ? "GRATIS (Recojo)" : "GRATIS"}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-white pt-3 border-t border-neutral-800">
                  <span>TOTAL A PAGAR</span>
                  <span className="text-accent-cyan font-mono">
                    {currencySymbol} {total.toFixed(2)} {currencyText}
                  </span>
                </div>
              </div>

              {/* Indicador Dinámico de la Pasarela Activa */}
              <div className="p-3 bg-black/60 rounded-xl border border-neutral-800 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs font-mono text-neutral-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Pasarela procesadora activa:</span>
                  <strong className="text-white uppercase font-bold">
                    {isLoadingGateway ? "Cargando..." : activeGateway === "mercadopago" ? "Mercado Pago 🇵🇪" : "Stripe Payments 💳"}
                  </strong>
                </div>
              </div>

              {/* Botón Principal de Envío y Pago */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-pill bg-white hover:bg-accent-cyan text-black font-extrabold text-sm py-4 px-6 transition-all flex items-center justify-center gap-3 uppercase font-mono shadow-xl shadow-white/10 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>REDIRIGIENDO A LA PASARELA...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>
                      {activeGateway === "mercadopago"
                        ? `Pagar ${currencySymbol} ${total.toFixed(2)} con Mercado Pago`
                        : `Pagar ${currencySymbol} ${total.toFixed(2)} con Stripe`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-500 pt-1">
                <span>⚡ Encriptación SSL 256-bit</span>
                <span>•</span>
                <span>GOSU® Garantía TCG</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
