"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Truck,
  Sparkles,
  Award,
  Store,
  MapPin,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useStoreSettings } from "@/providers/StoreProvider";
import { validateCouponAction } from "@/app/(shop)/actions";

const PERU_DEPARTMENTS = [
  "Lima",
  "Arequipa",
  "Cusco",
  "La Libertad",
  "Piura",
  "Lambayeque",
  "Junín",
  "Ancash",
  "Ica",
  "Puno",
  "Tacna",
  "Cajamarca",
  "Ayacucho",
  "Huánuco",
  "Loreto",
  "San Martín",
  "Ucayali",
];

export function CartDrawer() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const {
    items,
    isOpen,
    discount,
    loyaltyPointsUsed,
    toggleCart,
    updateQuantity,
    removeFromCart,
    applyDiscount,
    removeDiscount,
    applyLoyaltyPoints,
    removeLoyaltyPoints,
    getSubtotal,
    getDiscountAmount,
    getLoyaltyDiscountAmount,
    getTotalItems,
  } = useCartStore();

  const {
    freeShippingThreshold,
    standardShippingCost,
    currencySymbol,
    currency,
    exchangeRate,
    countryCode,
    isRegionActive,
    shippingMethods,
  } = useStoreSettings();

  const isPEN = currency === "PEN";

  // Tipo de entrega: "DELIVERY" (Domicilio) o "PICKUP" (Recojo en Tienda)
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("Lima");

  // Métodos especiales disponibles
  const pickupMethod = shippingMethods.find((m) => m.isPickup);
  const hasPickup = !!pickupMethod;

  // Filtrar tarifa de envío a domicilio según sub-zona seleccionada
  let activeShippingCost = standardShippingCost;
  let activeFreeThreshold = freeShippingThreshold;

  if (deliveryType === "PICKUP") {
    activeShippingCost = 0;
  } else if (shippingMethods.length > 0) {
    const matchingMethod = shippingMethods.find((m) => {
      if (m.isPickup) return false;
      if (!m.targetZones) return true; // Aplica a todo el país
      let zones: string[] = [];
      if (Array.isArray(m.targetZones)) zones = m.targetZones;
      else if (typeof m.targetZones === "string") {
        try {
          zones = JSON.parse(m.targetZones);
        } catch {
          zones = [];
        }
      }
      if (zones.length === 0) return true;
      return zones.includes(selectedDepartment);
    });

    if (matchingMethod) {
      activeShippingCost = matchingMethod.cost;
      if (matchingMethod.freeShippingThreshold) {
        activeFreeThreshold = matchingMethod.freeShippingThreshold;
      }
    }
  }

  // Estados locales para validación de cupones
  const [couponInput, setCouponInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const displaySubtotal = getSubtotal();
  const displayDiscount = getDiscountAmount();

  // Puntos disponibles del usuario autenticado
  const userLoyaltyPoints = (session?.user as any)?.loyaltyPoints || 0;
  const activePointsToRedeem = userLoyaltyPoints > 0 ? userLoyaltyPoints : 50;

  // Regla: 40 Puntos = S/. 1.00 PEN de descuento
  const calculatedPointsDiscountPEN = activePointsToRedeem / 40;
  const calculatedPointsDiscountUSD =
    exchangeRate > 0 ? calculatedPointsDiscountPEN / exchangeRate : calculatedPointsDiscountPEN;

  const displayLoyaltyDiscount = getLoyaltyDiscountAmount(exchangeRate, isPEN);

  // Envío Gratis
  const isFreeShipping = deliveryType === "PICKUP" || displaySubtotal >= activeFreeThreshold;
  const displayShippingCost =
    displaySubtotal > 0 ? (deliveryType === "PICKUP" || isFreeShipping ? 0 : activeShippingCost) : 0;
  const remainingForFreeShipping = Math.max(0, activeFreeThreshold - displaySubtotal);
  const shippingProgress = Math.min(100, (displaySubtotal / activeFreeThreshold) * 100);

  const displayFinalTotal = Math.max(
    0,
    displaySubtotal - displayDiscount - displayLoyaltyDiscount + displayShippingCost
  );
  const totalItems = getTotalItems();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidating(true);
    setCouponError(null);
    setCouponSuccess(null);

    const result = await validateCouponAction(couponInput, displaySubtotal);

    if (result.success && result.discount) {
      applyDiscount({
        code: result.discount.code,
        type: result.discount.type,
        value: result.discount.value,
        discountAmount: result.discount.discountAmount,
      });
      setCouponSuccess(`¡Código "${result.discount.code}" aplicado correctamente!`);
      setCouponInput("");
    } else {
      setCouponError(result.error || "Código de descuento inválido.");
    }

    setIsValidating(false);
  };

  const handleToggleLoyaltyPoints = () => {
    if (loyaltyPointsUsed > 0) {
      removeLoyaltyPoints();
    } else {
      applyLoyaltyPoints(activePointsToRedeem);
    }
  };

  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  const handleCheckout = async () => {
    if (!isRegionActive) {
      alert(`Los envíos a ${countryCode} están bloqueados temporalmente por la tienda.`);
      return;
    }

    try {
      setIsRedirectingToCheckout(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          discountCode: discount,
          loyaltyPointsUsed,
          currency: currency.toLowerCase(),
          countryCode,
          isPickup: deliveryType === "PICKUP",
          pickupAddress: pickupMethod?.pickupAddress || "",
        }),
      });

      const data = await res.json();

      if (data.url) {
        toggleCart(false);
        window.location.href = data.url;
      } else {
        alert(data.error || "Ocurrió un error al preparar el pago.");
        setIsRedirectingToCheckout(false);
      }
    } catch (err) {
      console.error("Error al procesar checkout:", err);
      alert("Error al conectar con la pasarela de pagos.");
      setIsRedirectingToCheckout(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop traslúcido */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Lateral Deslizante desde la derecha */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-black text-white border-l border-neutral-800 flex flex-col justify-between shadow-2xl font-body"
          >
            {/* Header del Carrito */}
            <div className="p-6 border-b border-neutral-800 bg-surface flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-neutral-900 rounded-full border border-neutral-700 text-accent-cyan">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base uppercase tracking-tight">
                      Tu Carrito ({countryCode})
                    </h2>
                    <span className="text-xs text-neutral-400 font-mono">
                      {totalItems} {totalItems === 1 ? "producto" : "productos"} • {currency}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleCart(false)}
                  className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Advertencia si la Región está Desactivada */}
              {!isRegionActive && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Los envíos a {countryCode} están desactivados temporalmente por mantenimiento logístico.</span>
                </div>
              )}

              {/* Barra Dinámica de Envío Gratis */}
              {isRegionActive && (
                <div className="space-y-1.5 pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs font-mono">
                    {deliveryType === "PICKUP" ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5" /> Recojo en Tienda Seleccionado (Gratis)
                      </span>
                    ) : isFreeShipping ? (
                      <span className="text-accent-green font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> ¡Envío Gratis Conseguido para {countryCode}!
                      </span>
                    ) : (
                      <span className="text-neutral-300">
                        Te faltan{" "}
                        <strong className="text-accent-cyan font-bold">
                          {currencySymbol}
                          {remainingForFreeShipping.toFixed(2)}
                        </strong>{" "}
                        para Envío Gratis
                      </span>
                    )}
                    <span className="text-neutral-500 font-bold">
                      {deliveryType === "PICKUP" ? "100%" : `${Math.round(shippingProgress)}%`}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: deliveryType === "PICKUP" ? "100%" : `${shippingProgress}%`,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`h-full ${
                        deliveryType === "PICKUP"
                          ? "bg-amber-400"
                          : isFreeShipping
                          ? "bg-accent-green"
                          : "bg-gradient-to-r from-accent-cyan to-accent-pink"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Ítems */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Tu carrito está vacío</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                      Explora el catálogo y agrega productos para comenzar tu compra.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleCart(false)}
                    className="btn-pill bg-white text-black font-bold text-xs hover:bg-accent-cyan transition-colors mt-2"
                  >
                    Ver Productos
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-surface rounded-xl border border-neutral-800 flex gap-4 items-center justify-between"
                  >
                    <div className="w-16 h-16 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-neutral-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-white truncate leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-xs font-mono text-accent-cyan block">
                        {currencySymbol}
                        {item.price.toFixed(2)}
                      </span>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-neutral-500 hover:text-rose-500 transition-colors"
                      title="Eliminar del carrito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Pie del Carrito */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-surface space-y-4">
                {/* Selector de Método de Entrega: Domicilio vs Recojo en Tienda */}
                {isRegionActive && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-300 block uppercase tracking-wider">
                      Método de Entrega
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("DELIVERY")}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                          deliveryType === "DELIVERY"
                            ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Envío a Domicilio</span>
                      </button>

                      {hasPickup && (
                        <button
                          type="button"
                          onClick={() => setDeliveryType("PICKUP")}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                            deliveryType === "PICKUP"
                              ? "bg-amber-400/10 border-amber-400 text-amber-400"
                              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <Store className="w-4 h-4" />
                          <span>Recojo en Tienda (Gratis)</span>
                        </button>
                      )}
                    </div>

                    {/* Sub-zona (Departamento) para Envío a Domicilio */}
                    {deliveryType === "DELIVERY" && countryCode === "PE" && (
                      <div className="pt-2">
                        <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                          Departamento de Entrega:
                        </label>
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-neutral-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-accent-cyan"
                        >
                          {PERU_DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Detalle de Recojo en Tienda */}
                    {deliveryType === "PICKUP" && pickupMethod && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1.5 text-xs text-amber-200">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{pickupMethod.pickupAddress || "Av. Larco 123, Miraflores"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{pickupMethod.pickupSchedule || "Lunes a Sábado: 11:00 AM - 7:30 PM"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Caja de Canje GOSU Loyalty */}
                <div className="p-3 bg-gradient-to-r from-accent-pink/10 to-purple-900/10 border border-accent-pink/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 text-accent-pink shrink-0" />
                    <div>
                      <span className="font-mono font-bold text-xs text-white block leading-tight">
                        Puntos GOSU®: {activePointsToRedeem} pts
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {isPEN
                          ? `Descuento de S/. ${calculatedPointsDiscountPEN.toFixed(2)} PEN (40 Pts = S/. 1.00)`
                          : `Descuento de $${calculatedPointsDiscountUSD.toFixed(2)} USD`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleLoyaltyPoints}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors ${
                      loyaltyPointsUsed > 0
                        ? "bg-accent-pink text-white hover:bg-rose-600"
                        : "bg-white text-black hover:bg-accent-pink hover:text-white"
                    }`}
                  >
                    {loyaltyPointsUsed > 0 ? "Aplicado" : "Canjear"}
                  </button>
                </div>

                {/* Formulario de Código de Descuento */}
                <div>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Código: GOSU10 o ALEX_TCG"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-black border border-neutral-700 rounded-lg text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-accent-cyan uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isValidating || !couponInput.trim()}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shrink-0"
                    >
                      {isValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Aplicar"}
                    </button>
                  </form>

                  {discount && (
                    <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Cupón `{discount.code}` (-{currencySymbol}
                          {displayDiscount.toFixed(2)})
                        </span>
                      </div>
                      <button
                        onClick={removeDiscount}
                        className="text-neutral-400 hover:text-white text-[11px] underline"
                      >
                        Quitar
                      </button>
                    </div>
                  )}

                  {couponError && (
                    <p className="text-[11px] text-rose-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {couponError}
                    </p>
                  )}
                  {couponSuccess && !discount && (
                    <p className="text-[11px] text-emerald-400 mt-1.5">{couponSuccess}</p>
                  )}
                </div>

                {/* Desglose Financiero */}
                <div className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">
                      {currencySymbol}
                      {displaySubtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      {deliveryType === "PICKUP" ? (
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Truck className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <span>
                        {deliveryType === "PICKUP"
                          ? "Recojo en Tienda"
                          : `Envío (${selectedDepartment || countryCode})`}
                      </span>
                    </span>
                    <span className="font-mono text-white">
                      {deliveryType === "PICKUP" || isFreeShipping ? (
                        <strong className="text-accent-green">GRATIS</strong>
                      ) : (
                        `${currencySymbol}${displayShippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {displayDiscount > 0 && (
                    <div className="flex justify-between text-accent-pink font-semibold">
                      <span>Descuento Cupón</span>
                      <span className="font-mono">
                        -{currencySymbol}
                        {displayDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {displayLoyaltyDiscount > 0 && (
                    <div className="flex justify-between text-purple-400 font-semibold">
                      <span>Descuento Puntos GOSU® (40 Pts = S/. 1)</span>
                      <span className="font-mono">
                        -{currencySymbol}
                        {displayLoyaltyDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-neutral-800">
                    <span>TOTAL ESTIMADO ({currency})</span>
                    <span className="font-mono text-accent-cyan text-base">
                      {currencySymbol}
                      {displayFinalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón de Checkout */}
                <button
                  onClick={handleCheckout}
                  disabled={isRedirectingToCheckout || !isRegionActive}
                  className="w-full btn-pill bg-white text-black font-extrabold text-sm py-3.5 hover:bg-accent-cyan transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50"
                >
                  {isRedirectingToCheckout ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>REDIRIGIENDO A STRIPE...</span>
                    </>
                  ) : !isRegionActive ? (
                    <span>ENVÍOS A {countryCode} DESACTIVADOS</span>
                  ) : (
                    <>
                      <span>
                        IR A PAGAR ({currencySymbol}
                        {displayFinalTotal.toFixed(2)} {currency})
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
