export function getPaymentGatewayName(order?: {
  paymentGateway?: string | null;
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
}): string {
  if (!order) return "Stripe Checkout";

  const gateway = (order.paymentGateway || "").toLowerCase();
  if (gateway === "mercadopago") return "Mercado Pago";
  if (gateway === "stripe") return "Stripe Checkout";

  // Fallback inteligente para órdenes registradas previamente
  const intent = order.stripePaymentIntentId || "";
  const session = order.stripeCheckoutSessionId || "";

  if (
    intent.startsWith("MP-") ||
    session.startsWith("MP-") ||
    (intent.length > 0 && !intent.startsWith("pi_") && /^\d+$/.test(intent))
  ) {
    return "Mercado Pago";
  }

  return "Stripe Checkout";
}
