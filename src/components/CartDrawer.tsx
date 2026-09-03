"use client";

import React, { useState } from "react";
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
  Image as ImageIcon
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { validateDiscountCodeAction } from "@/app/(shop)/actions";

export function CartDrawer() {
  const {
    items,
    isOpen,
    discount,
    toggleCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
    getSubtotal,
    getDiscountAmount,
    getTotal,
    getTotalItems,
  } = useCartStore();

  // Estados locales para validación de cupones
  const [couponInput, setCouponInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();
  const totalItems = getTotalItems();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsValidating(true);
    setCouponError(null);
    setCouponSuccess(null);

    const result = await validateDiscountCodeAction(couponInput, subtotal);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop traslúcido con Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleCart(false)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Lateral Deslizante desde la derecha (Framer Motion) */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-black text-white border-l border-neutral-800 flex flex-col justify-between shadow-2xl font-body"
          >
            {/* Header del Carrito */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-neutral-900 rounded-full border border-neutral-700 text-accent-cyan">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base uppercase tracking-tight">Tu Carrito</h2>
                  <span className="text-xs text-neutral-400 font-mono">
                    {totalItems} {totalItems === 1 ? "producto" : "productos"}
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

            {/* Lista de Ítems en el Carrito */}
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
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0 overflow-hidden flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-neutral-600" />
                      )}
                    </div>

                    {/* Ficha Corta y Controles */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-bold text-xs text-white truncate leading-tight">
                        {item.title}
                      </h4>
                      <span className="text-xs font-mono text-accent-cyan block">
                        ${item.price.toFixed(2)}
                      </span>

                      {/* Controles + / - */}
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

                    {/* Eliminar Ítem */}
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

            {/* Pie del Carrito: Descuentos, Totales y Checkout */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-surface space-y-4">
                {/* Formulario de Código de Descuento */}
                <div>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Código: PROMO10 o ALEX_TCG"
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

                  {/* Cupón Aplicado Status */}
                  {discount && (
                    <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center justify-between text-xs text-emerald-400">
                      <div className="flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Cupón `{discount.code}` (-${discountAmount.toFixed(2)})</span>
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

                {/* Desglose de Totales */}
                <div className="space-y-1.5 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent-pink font-semibold">
                      <span>Descuento aplicado</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-neutral-800">
                    <span>TOTAL ESTIMADO</span>
                    <span className="font-mono text-accent-cyan text-base">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botón de Checkout */}
                <button
                  onClick={() => {
                    alert(`Iniciando Checkout Stripe con Total = $${total.toFixed(2)} USD!`);
                  }}
                  className="w-full btn-pill bg-white text-black font-extrabold text-sm py-3.5 hover:bg-accent-cyan transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                >
                  <span>IR A PAGAR (CHECKOUT)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
